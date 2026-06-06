/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        parchment: {
          50: "#f5efe6",
          100: "#ebe0ce",
          200: "#d9c7a8",
          300: "#c2a87d",
          400: "#a88a5a",
          500: "#8b6e3e",
        },
        gothic: {
          bg: "#1a1410",
          surface: "#241c16",
          border: "#3a2e24",
          muted: "#5a4a3e",
          text: "#d4c4a8",
        },
        bronze: {
          DEFAULT: "#c9a227",
          light: "#e5c158",
          dark: "#9a7c17",
          muted: "#8b7336",
        },
        rust: {
          DEFAULT: "#8b2c2c",
          light: "#b84444",
          dark: "#6a1f1f",
        },
        verdigris: {
          DEFAULT: "#3d6b4f",
          light: "#5a9a74",
          dark: "#2a4a37",
        },
        ice: {
          DEFAULT: "#4a7fb5",
          light: "#6fa5d9",
          dark: "#355d8a",
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', "serif"],
        body: ['"Cormorant Garamond"', "serif"],
      },
      backgroundImage: {
        "parchment-texture":
          "radial-gradient(ellipse at center, rgba(201,162,39,0.08) 0%, transparent 70%), linear-gradient(180deg, rgba(235,224,206,0.02) 0%, rgba(26,20,16,0.1) 100%)",
        "metal-gradient":
          "linear-gradient(135deg, #e5c158 0%, #c9a227 25%, #9a7c17 50%, #c9a227 75%, #e5c158 100%)",
        "bronze-shine":
          "linear-gradient(90deg, transparent 0%, rgba(229,193,88,0.4) 50%, transparent 100%)",
      },
      boxShadow: {
        "metal-inset":
          "inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4)",
        "bronze-glow":
          "0 0 20px rgba(201,162,39,0.4), 0 0 40px rgba(201,162,39,0.15)",
        "rust-glow": "0 0 15px rgba(139,44,44,0.5)",
        "verdigris-glow": "0 0 15px rgba(61,107,79,0.5)",
        "ice-glow": "0 0 15px rgba(74,127,181,0.5)",
      },
      animation: {
        "gear-spin": "spin 12s linear infinite",
        "gear-spin-slow": "spin 20s linear infinite",
        "gear-spin-reverse": "spin 12s linear infinite reverse",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "flicker": "flicker 3s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "steam": "steam 4s ease-out infinite",
        "typewriter": "typewriter 3s steps(40, end)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.2)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.75" },
          "43%": { opacity: "1" },
          "45%": { opacity: "0.85" },
          "46%": { opacity: "1" },
          "49%": { opacity: "1" },
          "50%": { opacity: "0.7" },
          "51%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scale(0.8)" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1.4)" },
        },
        typewriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};
