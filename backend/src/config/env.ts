import "dotenv/config";

const frontendOrigins = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.FRONTEND_ORIGINS ?? "").split(","),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

export const env = {
  port: Number(process.env.PORT ?? 4000),
  sessionSecret: process.env.SESSION_SECRET ?? "local-secret",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  frontendOrigins: frontendOrigins.length > 0 ? frontendOrigins : ["http://localhost:5173"],
  cookieSecure: process.env.COOKIE_SECURE !== "false",
};
