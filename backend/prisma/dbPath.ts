import path from "node:path";

export function getDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const rawPath = url.replace(/^file:/, "");

  if (path.isAbsolute(rawPath)) return rawPath;

  return path.resolve(process.cwd(), rawPath);
}
