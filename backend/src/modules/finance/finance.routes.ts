import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { categories, summary } from "./finance.controller.js";
import * as expense from "./expense.controller.js";
import * as revenue from "./revenue.controller.js";

export const financeRouter = Router();
export const revenueRouter = Router();
export const expenseRouter = Router();

financeRouter.use(requireAdmin);
financeRouter.get("/summary", summary);
financeRouter.get("/categories", categories);

revenueRouter.use(requireAdmin);
revenueRouter.get("/", revenue.index);
revenueRouter.get("/:id", revenue.show);
revenueRouter.post("/", revenue.store);
revenueRouter.put("/:id", revenue.update);
revenueRouter.delete("/:id", revenue.destroy);

expenseRouter.use(requireAdmin);
expenseRouter.get("/", expense.index);
expenseRouter.get("/:id", expense.show);
expenseRouter.post("/", expense.store);
expenseRouter.put("/:id", expense.update);
expenseRouter.delete("/:id", expense.destroy);
