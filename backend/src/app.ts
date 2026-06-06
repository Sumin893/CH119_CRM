import cors from "cors";
import express from "express";
import session from "express-session";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { customerRouter } from "./modules/customers/customer.routes.js";
import { expenseRouter, financeRouter, revenueRouter } from "./modules/finance/finance.routes.js";
import { scheduleRouter } from "./modules/schedules/schedule.routes.js";
import { validateEncryptionConfig } from "./utils/crypto.js";
import "./modules/auth/session.js";

export const app = express();

validateEncryptionConfig();

app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/revenues", revenueRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/finance", financeRouter);
app.use(notFound);
app.use(errorHandler);
