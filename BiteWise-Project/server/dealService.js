import { db } from "./database.js";

const platformRows = db.prepare("SELECT * FROM platforms ORDER BY id");
const foodRows = db.prepare("SELECT * FROM foods ORDER BY title");
const foodByAlias = db.prepare(`
  SELECT foods.*
  FROM food_aliases
  JOIN foods ON foods.id = food_aliases.food_id
  WHERE food_aliases.alias = ?
`);
const dealsByFood = db.prepare(`
  SELECT
    deals.price,
    deals.original,
    deals.mins,
    deals.offer,
    deals.rating,
    platforms.id,
    platforms.name,
    platforms.logo,
    platforms.color,
    platforms.url_pattern AS urlPattern
  FROM deals
  JOIN platforms ON platforms.id = deals.platform_id
  WHERE deals.food_id = ?
  ORDER BY platforms.name
`);
const similarFoodRows = db.prepare(`
  SELECT food_key AS key, title, short, group_name AS groupName
  FROM foods
  WHERE group_name = ? AND id != ?
  ORDER BY title
  LIMIT 4
`);
const insertSearch = db.prepare(`
  INSERT INTO search_history (query, matched_food, best_platform, best_price, budget)
  VALUES (?, ?, ?, ?, ?)
`);

function toFood(row) {
  return {
    id: row.id,
    key: row.food_key,
    title: row.title,
    short: row.short,
    groupName: row.group_name,
  };
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function buildUrl(pattern, foodTitle) {
  return pattern
    .replace("{foodSlug}", encodeURIComponent(slugify(foodTitle)))
    .replace("{food}", encodeURIComponent(foodTitle));
}

function getCatalogFood(query) {
  const normalized = query.trim().toLowerCase();
  const row = foodByAlias.get(normalized);

  if (row) {
    return toFood(row);
  }

  return null;
}

function getDeals(food) {
  return dealsByFood.all(food.id).map((deal) => ({
    id: deal.id,
    name: deal.name,
    logo: deal.logo,
    color: deal.color,
    price: deal.price,
    original: deal.original,
    mins: deal.mins,
    offer: deal.offer,
    rating: deal.rating,
    url: buildUrl(deal.urlPattern, food.title),
  }));
}

function getGeneratedFood(query) {
  const title = query.trim() || "Pizza";
  const pizza = getCatalogFood("pizza");
  const platformMap = new Map(platformRows.all().map((platform) => [platform.id, platform]));

  return {
    food: {
      id: null,
      key: slugify(title),
      title,
      short: "FD",
      groupName: "quick-bites",
      generated: true,
    },
    results: getDeals(pizza).map((deal, index) => {
      const platform = platformMap.get(deal.id);

      return {
        ...deal,
        price: deal.price + 20 + index * 10,
        original: deal.original + 30,
        url: buildUrl(platform.url_pattern, title),
      };
    }),
  };
}

function calculateDealScore(item, results) {
  const maxPrice = Math.max(...results.map((result) => result.price));
  const minPrice = Math.min(...results.map((result) => result.price));
  const maxMins = Math.max(...results.map((result) => result.mins));
  const minMins = Math.min(...results.map((result) => result.mins));
  const priceRange = Math.max(maxPrice - minPrice, 1);
  const minsRange = Math.max(maxMins - minMins, 1);
  const priceScore = 1 - (item.price - minPrice) / priceRange;
  const speedScore = 1 - (item.mins - minMins) / minsRange;
  const ratingScore = (item.rating - 3.5) / 1.5;
  const offerScore = item.offer / 50;

  return Math.round((priceScore * 0.42 + speedScore * 0.22 + ratingScore * 0.22 + offerScore * 0.14) * 100);
}

function findBestDeal(results) {
  return [...results]
    .map((result) => ({
      ...result,
      aiScore: calculateDealScore(result, results),
    }))
    .sort((a, b) => b.aiScore - a.aiScore || a.price - b.price)[0];
}

function withScores(results) {
  return results.map((result) => ({
    ...result,
    aiScore: calculateDealScore(result, results),
  }));
}

function findBudgetMatches(maxBudget) {
  return foodRows
    .all()
    .map((row) => {
      const food = toFood(row);
      const results = getDeals(food);
      const best = findBestDeal(results);

      return { food, best };
    })
    .filter(({ best }) => best.price <= maxBudget)
    .sort((a, b) => b.best.aiScore - a.best.aiScore || a.best.price - b.best.price)
    .slice(0, 3);
}

export function listFoods() {
  return foodRows.all().map(toFood);
}

export function searchDeals(query = "Pizza", budget = 200) {
  const matchedFood = getCatalogFood(query);
  const base = matchedFood ? { food: matchedFood, results: getDeals(matchedFood) } : getGeneratedFood(query);
  const scoredResults = withScores(base.results);
  const best = findBestDeal(base.results);
  const cheapest = [...scoredResults].sort((a, b) => a.price - b.price)[0];
  const fastest = [...scoredResults].sort((a, b) => a.mins - b.mins)[0];
  const similarFoods = base.food.id
    ? similarFoodRows.all(base.food.groupName, base.food.id).map((food) => ({
        key: food.key,
        title: food.title,
        short: food.short,
        groupName: food.groupName,
      }))
    : similarFoodRows.all("quick-bites", 0).map((food) => ({
        key: food.key,
        title: food.title,
        short: food.short,
        groupName: food.groupName,
      }));

  insertSearch.run(query, base.food.title, best.name, best.price, budget);

  return {
    food: base.food,
    results: scoredResults,
    best,
    recommendation: {
      title: `${best.name} is recommended for ${base.food.title}.`,
      text: `AI score ${best.aiScore}/100 based on price, discount, delivery speed and rating. Final price is Rs. ${best.price}.`,
    },
    insights: {
      cheapest,
      fastest,
      similarFoods,
      budgetMatches: findBudgetMatches(budget),
    },
  };
}
