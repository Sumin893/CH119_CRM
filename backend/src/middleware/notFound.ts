import type { RequestHandler } from "express";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
};
