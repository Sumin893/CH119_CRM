import "dotenv/config";
import fs from "node:fs";
import { getDbPath } from "./dbPath.js";

const dbPath = getDbPath();

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
}

await import("./init.js");
