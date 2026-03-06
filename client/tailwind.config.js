/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                navy: {
                    50: '#eef2ff',
                    100: '#dce4fd',
                    200: '#bccafc',
                    300: '#8da5f9',
                    400: '#5b79f4',
                    500: '#3651ee',
                    600: '#2336e3',
                    700: '#1c28d0',
                    800: '#1d23a9',
                    900: '#0f1547',
                    950: '#0a0e2e',
                },
                gold: {
                    50: '#fff9eb',
                    100: '#ffefc6',
                    200: '#ffdc88',
                    300: '#ffc94a',
                    400: '#ffb520',
                    500: '#f99307',
                    600: '#dd6c02',
                    700: '#b74a06',
                    800: '#94380c',
                    900: '#7a2f0d',
                    950: '#461602',
                },
                severity: {
                    critical: '#ef4444',
                    high: '#f97316',
                    medium: '#eab308',
                    low: '#22c55e',
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    700: '#1a1f36',
                    800: '#111528',
                    900: '#0b0e1f',
                    950: '#060814',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                'glow-gold': '0 0 20px rgba(249, 147, 7, 0.3)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'count-up': 'countUp 1s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
