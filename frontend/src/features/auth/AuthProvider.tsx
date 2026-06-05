import { createContext, useEffect, useMemo, useState } from "react";
import { Admin, getMe, loginAdmin, logoutAdmin } from "../../api/auth";

type AuthContextValue = {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isLoading,
      login: async (email: string, password: string) => {
        const data = await loginAdmin(email, password);
        setAdmin(data.admin);
      },
      logout: async () => {
        await logoutAdmin();
        setAdmin(null);
      },
    }),
    [admin, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
