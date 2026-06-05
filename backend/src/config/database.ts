import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export function createPrismaAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  return new PrismaBetterSqlite3({ url });
}
