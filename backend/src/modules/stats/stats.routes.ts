import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import * as stats from "./stats.controller.js";

export const statsRouter = Router();

statsRouter.use(requireAdmin);
statsRouter.get("/summary", stats.summary);
statsRouter.get("/monthly", stats.monthly);
statsRouter.get("/categories", stats.categories);
statsRouter.get("/customers", stats.customers);
statsRouter.get("/revisit", stats.revisit);
statsRouter.get("/dashboard", stats.dashboard);
