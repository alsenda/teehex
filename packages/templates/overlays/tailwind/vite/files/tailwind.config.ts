import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: "#fff8dc",
          fg: "#101010",
          accent: "#00e5ff"
        }
      },
      boxShadow: {
        brutal: "8px 8px 0 #000",
        brutalSm: "4px 4px 0 #000"
      },
      borderWidth: {
        brutal: "3px"
      }
    }
  },
  plugins: []
};

export default config;
