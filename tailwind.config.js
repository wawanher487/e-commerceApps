/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // wajib agar Tailwind bisa scan komponen kamu
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
