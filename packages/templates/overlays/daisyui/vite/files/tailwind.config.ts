import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,svelte}"],
  theme: {
    extend: {
      boxShadow: {
        brutal: "8px 8px 0 #000",
        brutalSm: "4px 4px 0 #000"
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        neo: {
          primary: "#00e5ff",
          secondary: "#f7f7f7",
          accent: "#00e5ff",
          neutral: "#101010",
          "base-100": "#ffffff",
          "base-200": "#fff8dc",
          "base-300": "#f7f7f7",
          info: "#00e5ff",
          success: "#4ade80",
          warning: "#facc15",
          error: "#f87171"
        }
      }
    ]
  }
};

export default config;
