import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { answerChat } from "./chatService.js";
import { getDatabasePath } from "./database.js";
import { loadEnv } from "./env.js";
import { listFoods, searchDeals } from "./dealService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

loadEnv(rootDir);

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(data));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendNotFound(response) {
  sendJson(response, 404, { error: "Not found" });
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(rootDir, safePath);

  if (!filePath.startsWith(rootDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      status: "ok",
      database: getDatabasePath(),
      llmConfigured: Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY !== "your_api_key_here"),
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/foods") {
    sendJson(response, 200, { foods: listFoods() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/search") {
    const food = url.searchParams.get("food") || "Pizza";
    const budget = Number(url.searchParams.get("budget") || 200);
    sendJson(response, 200, searchDeals(food, Number.isFinite(budget) ? budget : 200));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/chat") {
    const body = await readJsonBody(request);
    const result = await answerChat(body.prompt);
    sendJson(response, 200, result);
    return;
  }

  sendNotFound(response);
}

const server = createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }

    serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: "Internal server error", detail: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`BiteWise backend running at http://${host}:${port}`);
});
