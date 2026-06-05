import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
