import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  sessionSecret: process.env.SESSION_SECRET ?? "local-secret",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  cookieSecure: process.env.COOKIE_SECURE !== "false",
};
