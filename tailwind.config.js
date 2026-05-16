/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cgo: {
          bg: "#0f1419",
          panel: "#1a222d",
          border: "#2a3544",
          muted: "#8b9aad",
          accent: "#3b82f6",
          good: "#22c55e",
          warn: "#eab308",
          bad: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
