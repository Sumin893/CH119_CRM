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
import { statsRouter } from "./modules/stats/stats.routes.js";
import { validateEncryptionConfig } from "./utils/crypto.js";
import "./modules/auth/session.js";

export const app = express();

validateEncryptionConfig();

app.set("trust proxy", 1);

const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || env.frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin is not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(
  session({
    name: "connect.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/revenues", revenueRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/finance", financeRouter);
app.use("/api/stats", statsRouter);

app.use(notFound);
app.use(errorHandler);