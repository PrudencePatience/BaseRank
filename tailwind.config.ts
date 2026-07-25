import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#101114",
        panel: "#20232b",
        line: "#313640",
        gold: "#f3c85f",
        silver: "#cfd5df",
        bronze: "#c88955",
        mint: "#77f0a3"
      },
      boxShadow: {
        glow: "0 22px 80px rgba(0, 0, 0, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
