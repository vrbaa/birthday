import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E9EEE7",
        ink: "#18241D",
        inksoft: "#55655B",
        pine: "#2C6249",
        pinedark: "#1E4433",
        ochre: "#C98A21",
        ochrebg: "#FCF6E8",
        line: "#CBD6C9",
        muted: "#98A79C",
        danger: "#9B3B2C",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      maxWidth: { app: "36rem" },
    },
  },
  plugins: [],
} satisfies Config;
