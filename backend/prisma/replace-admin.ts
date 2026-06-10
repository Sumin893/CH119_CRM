import "dotenv/config";
import * as mariadb from "mariadb";
import { hashPassword } from "../src/utils/password.js";

const email = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const deleteEmails = (process.env.ADMIN_DELETE_EMAILS ?? "admin,admin@homeclean119.kr")
  .split(",")
  .map((value) => value.trim())
  .filter((value) => value.length > 0 && value !== email);

function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const url = new URL(databaseUrl);

  return {
    database: url.pathname.replace(/^\//, ""),
    host: url.hostname,
    password: decodeURIComponent(url.password),
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    allowPublicKeyRetrieval: true,
  };
}

async function main() {
  if (!email || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required.");
  }

  const connection = await mariadb.createConnection(getDatabaseConfig());
  const passwordHash = await hashPassword(password);

  await connection.query(
    `
      INSERT INTO Admin (email, name, passwordHash, createdAt, updatedAt)
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        passwordHash = VALUES(passwordHash),
        updatedAt = NOW()
    `,
    [email, "관리자", passwordHash],
  );

  let deletedCount = 0;

  if (deleteEmails.length > 0) {
    const result = await connection.query("DELETE FROM Admin WHERE email IN (?)", [deleteEmails]);
    deletedCount = Number(result.affectedRows ?? 0);
  }

  await connection.end();

  console.log(`Admin account is ready: ${email}`);
  console.log(`Deleted old admin accounts: ${deletedCount}`);
}

main();
