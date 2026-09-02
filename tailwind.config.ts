import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kiosk: {
          navy: {
            DEFAULT: "#0F2942",
            dark: "#081827",
            light: "#1E3A5F",
          },
          blue: {
            DEFAULT: "#0284C7",
            dark: "#0369A1",
            light: "#E0F2FE",
            vibrant: "#0070F3",
          },
          teal: {
            DEFAULT: "#0D9488",
            light: "#CCFBF1",
          },
          surface: {
            DEFAULT: "#FFFFFF",
            subtle: "#F8FAFC",
            muted: "#F1F5F9",
            card: "#FFFFFF",
            border: "#E2E8F0",
          },
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            muted: "#64748B",
            inverse: "#FFFFFF",
          },
          accent: {
            green: "#16A34A",
            greenLight: "#DCFCE7",
            amber: "#D97706",
            amberLight: "#FEF3C7",
            rose: "#E11D48",
            roseLight: "#FFE4E6",
          }
        },
      },
      fontSize: {
        'kiosk-hero': ['2.75rem', { lineHeight: '1.2', fontWeight: '800' }],
        'kiosk-title': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'kiosk-subtitle': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'kiosk-card': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'kiosk-body': ['1.25rem', { lineHeight: '1.5', fontWeight: '400' }],
        'kiosk-btn': ['1.35rem', { lineHeight: '1.2', fontWeight: '700' }],
        'kiosk-sm': ['1.1rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      boxShadow: {
        'kiosk-card': '0 10px 25px -5px rgba(15, 41, 66, 0.08), 0 8px 10px -6px rgba(15, 41, 66, 0.04)',
        'kiosk-elevated': '0 20px 35px -10px rgba(15, 41, 66, 0.15)',
        'kiosk-button': '0 6px 16px -2px rgba(2, 132, 199, 0.35)',
      },
      borderRadius: {
        'kiosk': '1.25rem',
        'kiosk-lg': '1.75rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
