import { api } from "./http";

export type Admin = {
  id: number;
  email: string;
  name: string;
};

export function loginAdmin(email: string, password: string) {
  return api<{ admin: Admin }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAdmin() {
  return api<{ message: string }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getMe() {
  return api<{ admin: Admin }>("/api/auth/me");
}
