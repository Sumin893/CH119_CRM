import type { Request, Response } from "express";
import {
  getStatsCategories,
  getStatsCustomers,
  getStatsDashboard,
  getStatsMonthly,
  getStatsRevisit,
  getStatsSummary,
} from "./stats.service.js";

export async function summary(req: Request, res: Response) {
  res.json(await getStatsSummary(req.query));
}

export async function monthly(req: Request, res: Response) {
  res.json(await getStatsMonthly(req.query));
}

export async function categories(req: Request, res: Response) {
  res.json(await getStatsCategories(req.query));
}

export async function customers(req: Request, res: Response) {
  res.json(await getStatsCustomers(req.query));
}

export async function revisit(_req: Request, res: Response) {
  res.json(await getStatsRevisit());
}

export async function dashboard(_req: Request, res: Response) {
  res.json(await getStatsDashboard());
}
