import { answerChat } from "../server/chatService.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const result = await answerChat(body.prompt);
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: "Internal server error", detail: error.message });
  }
}
