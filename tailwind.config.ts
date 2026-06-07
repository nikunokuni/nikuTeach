import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff", 100: "#d9eaff", 200: "#bcd9ff", 300: "#8ec0ff",
          400: "#599dff", 500: "#3479fb", 600: "#1f5bef", 700: "#1947db",
          800: "#1b3cb1", 900: "#1c378b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
