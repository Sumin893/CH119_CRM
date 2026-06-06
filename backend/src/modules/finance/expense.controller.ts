import type { RequestHandler } from "express";
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from "./expense.service.js";

function idOf(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export const index: RequestHandler = async (req, res) => {
  res.json({ expenses: await listExpenses(req.query) });
};

export const show: RequestHandler = async (req, res) => {
  const expense = await getExpense(idOf(req.params.id) ?? 0);

  if (!expense) {
    res.status(404).json({ message: "비용 내역을 찾을 수 없습니다." });
    return;
  }

  res.json({ expense });
};

export const store: RequestHandler = async (req, res) => {
  const result = await createExpense(req.body);

  if ("message" in result) {
    res.status(400).json({ message: result.message });
    return;
  }

  res.status(201).json({ expense: result.expense });
};

export const update: RequestHandler = async (req, res) => {
  const result = await updateExpense(idOf(req.params.id) ?? 0, req.body);

  if ("message" in result) {
    res.status(result.status ?? 400).json({ message: result.message });
    return;
  }

  res.json({ expense: result.expense });
};

export const destroy: RequestHandler = async (req, res) => {
  const deleted = await deleteExpense(idOf(req.params.id) ?? 0);

  if (!deleted) {
    res.status(404).json({ message: "비용 내역을 찾을 수 없습니다." });
    return;
  }

  res.json({ message: "비용 내역이 삭제되었습니다." });
};
