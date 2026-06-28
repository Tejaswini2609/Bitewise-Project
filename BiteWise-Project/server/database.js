import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { foods, platforms } from "./seedData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const databasePath = join(dataDir, "bitewise.sqlite");

mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    color TEXT NOT NULL,
    url_pattern TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    short TEXT NOT NULL,
    group_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS food_aliases (
    alias TEXT PRIMARY KEY,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    original INTEGER NOT NULL,
    mins INTEGER NOT NULL,
    offer INTEGER NOT NULL,
    rating REAL NOT NULL,
    UNIQUE(food_id, platform_id)
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    matched_food TEXT NOT NULL,
    best_platform TEXT NOT NULL,
    best_price INTEGER NOT NULL,
    budget INTEGER NOT NULL,
    searched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertPlatform = db.prepare(`
  INSERT INTO platforms (id, name, logo, color, url_pattern)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    logo = excluded.logo,
    color = excluded.color,
    url_pattern = excluded.url_pattern
`);

const insertFood = db.prepare(`
  INSERT INTO foods (food_key, title, short, group_name)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(food_key) DO UPDATE SET
    title = excluded.title,
    short = excluded.short,
    group_name = excluded.group_name
`);

const selectFoodId = db.prepare("SELECT id FROM foods WHERE food_key = ?");
const insertAlias = db.prepare(`
  INSERT INTO food_aliases (alias, food_id)
  VALUES (?, ?)
  ON CONFLICT(alias) DO UPDATE SET food_id = excluded.food_id
`);

const insertDeal = db.prepare(`
  INSERT INTO deals (food_id, platform_id, price, original, mins, offer, rating)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(food_id, platform_id) DO UPDATE SET
    price = excluded.price,
    original = excluded.original,
    mins = excluded.mins,
    offer = excluded.offer,
    rating = excluded.rating
`);

function seed() {
  db.exec("BEGIN");

  try {
  for (const platform of platforms) {
    insertPlatform.run(platform.id, platform.name, platform.logo, platform.color, platform.urlPattern);
  }

  for (const food of foods) {
    insertFood.run(food.key, food.title, food.short, food.groupName);
    const foodId = selectFoodId.get(food.key).id;
    const aliases = new Set([food.key, food.title.toLowerCase(), ...(food.aliases || [])]);

    for (const alias of aliases) {
      insertAlias.run(alias, foodId);
    }

    for (const deal of food.deals) {
      insertDeal.run(foodId, deal.platformId, deal.price, deal.original, deal.mins, deal.offer, deal.rating);
    }
  }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

seed();

export function getDatabasePath() {
  return databasePath;
}
