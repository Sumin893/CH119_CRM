import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "./database.js";

export const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
});
