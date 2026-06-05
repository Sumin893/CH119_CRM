import type { RequestHandler } from "express";
import { findAdminById, validateAdmin } from "./auth.service.js";

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    return;
  }

  const admin = await validateAdmin(email, password);

  if (!admin) {
    res.status(401).json({ message: "로그인 정보가 올바르지 않습니다." });
    return;
  }

  req.session.adminId = admin.id;
  res.json({ admin });
};

export const logout: RequestHandler = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "로그아웃되었습니다." });
  });
};

export const me: RequestHandler = async (req, res) => {
  if (!req.session.adminId) {
    res.status(401).json({ message: "로그인이 필요합니다." });
    return;
  }

  const admin = await findAdminById(req.session.adminId);

  if (!admin) {
    req.session.destroy(() => undefined);
    res.status(401).json({ message: "관리자를 찾을 수 없습니다." });
    return;
  }

  res.json({ admin });
};
