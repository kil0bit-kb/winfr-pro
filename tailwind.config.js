/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Sapphire Professional Brand Colors
                "brand-blue-50": "#eff6ff",
                "brand-blue-100": "#dbeafe",
                "brand-blue-200": "#bfdbfe",
                "brand-blue-300": "#93c5fd",
                "brand-blue-400": "#60a5fa",
                "brand-blue-500": "#3b82f6",
                "brand-blue-600": "#2563eb",
                "brand-blue-700": "#1d4ed8",
                "brand-blue-800": "#1e40af",
                "brand-blue-900": "#1e3a8a",
                "brand-blue-950": "#172554",

                "brand-blue-light": "#60a5fa",
                "brand-blue": "#3b82f6",
                "brand-blue-dark": "#1e40af",
                "brand-blue-neon": "var(--brand-blue-neon)",
                "brand-cyan-neon": "var(--brand-cyan-neon)",

                "brand-cyan-50": "#ecfeff",
                "brand-cyan-100": "#cffafe",
                "brand-cyan-200": "#a5f3fc",
                "brand-cyan-300": "#67e8f9",
                "brand-cyan-400": "#22d3ee",
                "brand-cyan-500": "#06b6d4",
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: `calc(var(--radius) - 4px)`,
            },
        },
    },
    plugins: [],
}
