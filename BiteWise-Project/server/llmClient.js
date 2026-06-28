export async function completeChat({ messages, searchData }) {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey || apiKey === "your_api_key_here") {
    return buildFallbackAnswer(searchData);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: 240,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM request failed with ${response.status}: ${detail.slice(0, 180)}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("LLM returned an empty response.");
  }

  return answer;
}

function buildFallbackAnswer(searchData) {
  const { food, best, insights } = searchData;
  const similar = insights.similarFoods.map((item) => item.title).join(", ");
  const budget = insights.budgetMatches
    .map(({ food: matchFood, best: matchBest }) => `${matchFood.title} on ${matchBest.name} at Rs. ${matchBest.price}`)
    .join("; ");

  if (food.generated) {
    return `I could not find an exact database match for "${food.title}". Try ${similar || "Pizza, Burger, or Pasta"} instead. ${budget ? `Under your budget, good options are ${budget}. ` : ""}For the closest comparable search, ${best.name} gives the best value at Rs. ${best.price}, with ${best.offer}% off, ${best.mins} min delivery, ${best.rating} rating, and an AI score of ${best.aiScore}.`;
  }

  return `${best.name} is my pick for ${food.title}. It has the strongest value because the final price is Rs. ${best.price}, the discount is ${best.offer}%, delivery is about ${best.mins} minutes, rating is ${best.rating}, and the AI score is ${best.aiScore}/100. Budget-friendly ideas: ${budget || similar || "increase the budget slightly for more matches"}.`;
}
