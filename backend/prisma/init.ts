import "dotenv/config";
import Database from "better-sqlite3";
import { getDbPath } from "./dbPath.js";

const db = new Database(getDbPath());

db.exec(`
  CREATE TABLE IF NOT EXISTS "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.close();
