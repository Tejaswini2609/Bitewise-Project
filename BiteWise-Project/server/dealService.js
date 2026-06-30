import { foods, platforms } from "./seedData.js";

const platformMap = new Map(platforms.map((platform) => [platform.id, platform]));

function toFood(food, index) {
  return {
    id: index + 1,
    key: food.key,
    title: food.title,
    short: food.short,
    groupName: food.groupName,
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

  const index = foods.findIndex((food) => {
    const aliases = new Set([food.key, food.title.toLowerCase(), ...(food.aliases || [])]);
    return aliases.has(normalized);
  });

  return index >= 0 ? toFood(foods[index], index) : null;
}

function getFoodSeed(food) {
  return foods.find((item) => item.key === food.key);
}

function getDeals(food) {
  const foodSeed = getFoodSeed(food);

  return foodSeed.deals.map((deal) => {
    const platform = platformMap.get(deal.platformId);

    return {
      id: platform.id,
      name: platform.name,
      logo: platform.logo,
      color: platform.color,
      price: deal.price,
      original: deal.original,
      mins: deal.mins,
      offer: deal.offer,
      rating: deal.rating,
      url: buildUrl(platform.urlPattern, food.title),
    };
  });
}

function getGeneratedFood(query) {
  const title = query.trim() || "Pizza";
  const pizza = getCatalogFood("pizza");

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
        url: buildUrl(platform.urlPattern, title),
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
  return foods
    .map((food, index) => {
      const catalogFood = toFood(food, index);
      const results = getDeals(catalogFood);
      const best = findBestDeal(results);

      return { food: catalogFood, best };
    })
    .filter(({ best }) => best.price <= maxBudget)
    .sort((a, b) => b.best.aiScore - a.best.aiScore || a.best.price - b.best.price)
    .slice(0, 3);
}

function findSimilarFoods(food) {
  return foods
    .map(toFood)
    .filter((item) => item.groupName === food.groupName && item.key !== food.key)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 4)
    .map(({ key, title, short, groupName }) => ({ key, title, short, groupName }));
}

export function listFoods() {
  return foods.map(toFood).sort((a, b) => a.title.localeCompare(b.title));
}

export function searchDeals(query = "Pizza", budget = 200) {
  const matchedFood = getCatalogFood(query);
  const base = matchedFood ? { food: matchedFood, results: getDeals(matchedFood) } : getGeneratedFood(query);
  const scoredResults = withScores(base.results);
  const best = findBestDeal(base.results);
  const cheapest = [...scoredResults].sort((a, b) => a.price - b.price)[0];
  const fastest = [...scoredResults].sort((a, b) => a.mins - b.mins)[0];
  const similarFoods = base.food.id ? findSimilarFoods(base.food) : findSimilarFoods({ key: "", groupName: "quick-bites" });

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
