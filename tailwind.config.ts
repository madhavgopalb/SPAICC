import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        brand: "#155e75",
        signal: "#b45309",
        ok: "#15803d",
        risk: "#b91c1c"
      }
    }
  },
  plugins: []
};

export default config;
