import type { RequestHandler } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "./customer.service.js";
import { validateRequired } from "./customer.validators.js";

function parseId(value: unknown) {
  const id = Number(value);

  return Number.isInteger(id) ? id : null;
}

export const index: RequestHandler = async (req, res) => {
  const customers = await listCustomers(req.query);

  res.json({ customers });
};

export const show: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  const customer = id ? await getCustomer(id) : null;

  if (!customer) {
    res.status(404).json({ message: "고객을 찾을 수 없습니다." });
    return;
  }

  res.json({ customer });
};

export const store: RequestHandler = async (req, res) => {
  const message = validateRequired(req.body);

  if (message) {
    res.status(400).json({ message });
    return;
  }

  const customer = await createCustomer(req.body);

  res.status(201).json({ customer });
};

export const update: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  const message = validateRequired(req.body);

  if (message) {
    res.status(400).json({ message });
    return;
  }

  const customer = id ? await updateCustomer(id, req.body) : null;

  if (!customer) {
    res.status(404).json({ message: "고객을 찾을 수 없습니다." });
    return;
  }

  res.json({ customer });
};

export const destroy: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  const deleted = id ? await deleteCustomer(id) : false;

  if (!deleted) {
    res.status(404).json({ message: "고객을 찾을 수 없습니다." });
    return;
  }

  res.json({ message: "고객이 삭제되었습니다." });
};
