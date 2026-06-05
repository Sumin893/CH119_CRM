import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { index, upcoming } from "./schedule.controller.js";

export const scheduleRouter = Router();

scheduleRouter.use(requireAdmin);
scheduleRouter.get("/upcoming", upcoming);
scheduleRouter.get("/", index);
