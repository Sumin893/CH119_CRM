import type { RequestHandler } from "express";
import { createRevenue, deleteRevenue, getRevenue, listRevenues, updateRevenue } from "./revenue.service.js";

function idOf(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export const index: RequestHandler = async (req, res) => {
  res.json({ revenues: await listRevenues(req.query) });
};

export const show: RequestHandler = async (req, res) => {
  const revenue = await getRevenue(idOf(req.params.id) ?? 0);

  if (!revenue) {
    res.status(404).json({ message: "수입 내역을 찾을 수 없습니다." });
    return;
  }

  res.json({ revenue });
};

export const store: RequestHandler = async (req, res) => {
  const result = await createRevenue(req.body);

  if ("message" in result) {
    res.status(400).json({ message: result.message });
    return;
  }

  res.status(201).json({ revenue: result.revenue });
};

export const update: RequestHandler = async (req, res) => {
  const result = await updateRevenue(idOf(req.params.id) ?? 0, req.body);

  if ("message" in result) {
    res.status(result.status ?? 400).json({ message: result.message });
    return;
  }

  res.json({ revenue: result.revenue });
};

export const destroy: RequestHandler = async (req, res) => {
  const deleted = await deleteRevenue(idOf(req.params.id) ?? 0);

  if (!deleted) {
    res.status(404).json({ message: "수입 내역을 찾을 수 없습니다." });
    return;
  }

  res.json({ message: "수입 내역이 삭제되었습니다." });
};
