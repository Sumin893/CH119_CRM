import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
};
