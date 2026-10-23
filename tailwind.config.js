/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vulcan: {
          bg: "#050506",
          card: "#0d0d0f",
          surface: "#121215",
          border: "#1f1f25",
          borderHover: "#30303a",
          textMuted: "#8e8e9c",
          textFaint: "#555562",
          gold: {
            DEFAULT: "#F5A623",
            light: "#FBBF24",
            dark: "#C68212",
            subtle: "rgba(245, 166, 35, 0.12)",
            glow: "rgba(245, 166, 35, 0.35)",
            border: "rgba(245, 166, 35, 0.25)",
          }
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Outfit'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionTimingFunction: {
        'emil-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'emil-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'emil-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        pixelFloat: 'pixelFloat 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
