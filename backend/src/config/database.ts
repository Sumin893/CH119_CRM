import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export function createPrismaAdapter() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL 환경변수가 필요합니다.");
  }

  return new PrismaMariaDb(url);
}
