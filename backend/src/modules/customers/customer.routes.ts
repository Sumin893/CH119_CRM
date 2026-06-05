import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { destroy, index, show, store, update } from "./customer.controller.js";

export const customerRouter = Router();

customerRouter.use(requireAdmin);
customerRouter.get("/", index);
customerRouter.get("/:id", show);
customerRouter.post("/", store);
customerRouter.put("/:id", update);
customerRouter.delete("/:id", destroy);
