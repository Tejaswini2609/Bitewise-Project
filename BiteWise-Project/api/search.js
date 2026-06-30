import { searchDeals } from "../server/dealService.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const food = request.query.food || "Pizza";
  const budget = Number(request.query.budget || 200);

  response.status(200).json(searchDeals(food, Number.isFinite(budget) ? budget : 200));
}
