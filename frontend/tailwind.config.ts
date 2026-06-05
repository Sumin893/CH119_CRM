import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#123348",
          blue: "#139FE5",
          cyan: "#17C6D5",
          mint: "#5FE09D",
          lime: "#E7EA2D",
          soft: "#F3FBFC",
        },
      },
      boxShadow: {
        panel: "0 18px 45px rgba(18, 51, 72, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
