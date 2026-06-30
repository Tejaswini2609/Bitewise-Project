export default function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  response.status(200).json({
    status: "ok",
    database: "seed-data",
    llmConfigured: Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY !== "your_api_key_here"),
  });
}
