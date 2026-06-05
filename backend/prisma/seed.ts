import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "../src/config/database.js";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
});

const email = "admin@homeclean119.kr";

async function main() {
  const passwordHash = await hashPassword("HomeClean119!");

  await prisma.admin.upsert({
    where: { email },
    update: { name: "관리자", passwordHash },
    create: { email, name: "관리자", passwordHash },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
