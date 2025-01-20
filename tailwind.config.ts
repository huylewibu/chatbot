import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#f9fafb", // Màu nền Light Mode
          dark: "#1a202c",  // Màu nền Dark Mode
        },
        text: {
          light: "#374151", // Màu chữ Light Mode
          dark: "#f9fafb",  // Màu chữ Dark Mode
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
