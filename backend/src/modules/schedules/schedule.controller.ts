import type { RequestHandler } from "express";
import { listSchedules, listUpcomingSchedules } from "./schedule.service.js";

export const index: RequestHandler = async (req, res) => {
  const schedules = await listSchedules(req.query);

  res.json({ schedules });
};

export const upcoming: RequestHandler = async (req, res) => {
  const days = Math.max(1, Math.min(Number(req.query.days ?? 7), 60));
  const schedules = await listUpcomingSchedules(days);

  res.json({ schedules });
};
