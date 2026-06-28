import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadEnv(rootDir) {
  const envPath = join(rootDir, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const rows = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const row of rows) {
    const trimmed = row.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
