import type { RequestHandler } from "express";
import { getFinanceCategories, getFinanceSummary } from "./finance.service.js";

export const summary: RequestHandler = async (req, res) => {
  res.json(await getFinanceSummary(req.query));
};

export const categories: RequestHandler = async (req, res) => {
  res.json(await getFinanceCategories(req.query));
};
