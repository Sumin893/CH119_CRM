import { prisma } from "../../config/prisma.js";
import { verifyPassword } from "../../utils/password.js";

export async function validateAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) return null;

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) return null;

  return { id: admin.id, email: admin.email, name: admin.name };
}

export async function findAdminById(id: number) {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });

  return admin;
}
