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

  CREATE TABLE IF NOT EXISTS "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phoneEncrypted" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "addressEncrypted" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productBrand" TEXT,
    "productCount" INTEGER NOT NULL DEFAULT 1,
    "estimateRequestDate" DATETIME,
    "workDate" DATETIME,
    "workStartTime" TEXT,
    "workEndTime" TEXT,
    "estimatePrice" INTEGER,
    "finalPrice" INTEGER,
    "deposit" INTEGER,
    "balance" INTEGER,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL,
    "customerStatus" TEXT NOT NULL,
    "memo" TEXT,
    "specialNote" TEXT,
    "revisitDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS "Customer_phoneHash_idx" ON "Customer"("phoneHash");
  CREATE INDEX IF NOT EXISTS "Customer_productCategory_idx" ON "Customer"("productCategory");
  CREATE INDEX IF NOT EXISTS "Customer_customerStatus_idx" ON "Customer"("customerStatus");
  CREATE INDEX IF NOT EXISTS "Customer_paymentStatus_idx" ON "Customer"("paymentStatus");
  CREATE INDEX IF NOT EXISTS "Customer_workDate_idx" ON "Customer"("workDate");
  CREATE INDEX IF NOT EXISTS "Customer_revisitDate_idx" ON "Customer"("revisitDate");
`);

db.close();
