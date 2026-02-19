/** @type {import('tailwindcss').Config} */
module.exports = {
  // distinct file paths to your folders
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Professional Blue
        secondary: "#10B981", // Success Green
        background: "#F3F4F6", // Light Gray Background
      }
    },
  },
  plugins: [],
}