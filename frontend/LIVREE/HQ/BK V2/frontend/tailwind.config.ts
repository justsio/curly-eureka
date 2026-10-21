import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A859',
        secondary: '#FFB81C',
        dark: '#1A1A1A',
        light: '#F5F5F5',
      },
    },
  },
  plugins: [],
}
export default config
