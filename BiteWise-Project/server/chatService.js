import { completeChat } from "./llmClient.js";
import { listFoods, searchDeals } from "./dealService.js";

const vegetarianHints = [
  "dosa",
  "fries",
  "gobi manchurian",
  "idli",
  "paneer tikka",
  "pizza",
  "veg thali",
];

export async function answerChat(prompt) {
  const cleanPrompt = String(prompt || "").trim();

  if (!cleanPrompt) {
    return {
      answer: "Ask me about a food, platform, price, delivery speed, or budget and I will compare the best BiteWise options.",
    };
  }

  const foods = listFoods();
  const budget = extractBudget(cleanPrompt) || 200;
  const knownFood = extractFoodName(cleanPrompt, foods);
  const foodName = knownFood || extractUnavailableFood(cleanPrompt) || pickFoodForIntent(cleanPrompt);
  const searchData = searchDeals(foodName, budget);
  const messages = buildMessages(cleanPrompt, budget, searchData);
  const answer = await completeChat({ messages, searchData });

  return {
    answer,
    matchedFood: searchData.food,
    best: searchData.best,
    usedBudget: budget,
    search: searchData,
  };
}

function extractBudget(prompt) {
  const match = prompt.match(/(?:rs\.?|₹|inr)?\s*(\d{2,5})/i);
  return match ? Number(match[1]) : null;
}

function extractFoodName(prompt, foods) {
  const normalized = prompt.toLowerCase();

  return foods
    .map((food) => food.title)
    .sort((a, b) => b.length - a.length)
    .find((title) => normalized.includes(title.toLowerCase()));
}

function extractUnavailableFood(prompt) {
  const normalized = prompt
    .toLowerCase()
    .replace(/[₹?.,!]/g, " ")
    .replace(/\b\d{2,5}\b/g, " ");

  if (/\bveg|vegetarian|cheapest|budget|value|platform|app\b/.test(normalized) && !/\bfor\s+\w+|\bfind\s+\w+/.test(normalized)) {
    return null;
  }

  const phraseMatch = normalized.match(/\b(?:find|compare|for|want|have|search)\s+([a-z][a-z\s-]{1,28})/);
  const phrase = phraseMatch?.[1]
    ?.replace(/\b(?:under|below|on|from|delivery|price|deal|food|please|best|cheapest|fastest)\b.*$/g, "")
    .trim();

  if (phrase && !isGenericPhrase(phrase)) {
    return toTitle(phrase);
  }

  return null;
}

function pickFoodForIntent(prompt) {
  const normalized = prompt.toLowerCase();

  if (/\bveg|vegetarian|paneer\b/.test(normalized)) {
    return vegetarianHints[0];
  }

  if (/\bcheap|cheapest|budget|under\b/.test(normalized)) {
    return "pizza";
  }

  return "pizza";
}

function isGenericPhrase(value) {
  return /^(food|something|anything|best|value|platform|app)$/.test(value);
}

function toTitle(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function buildMessages(prompt, budget, searchData) {
  return [
    {
      role: "system",
      content:
        "You are BiteWise AI Assistant. Answer in 2-4 concise sentences using only the provided BiteWise search data. Explain recommendations using price, discount, delivery time, rating, and AI score. If the exact food is unavailable, say so and recommend similar foods from the data.",
    },
    {
      role: "user",
      content: JSON.stringify({
        prompt,
        budget,
        food: searchData.food,
        results: searchData.results,
        best: searchData.best,
        insights: searchData.insights,
      }),
    },
  ];
}
