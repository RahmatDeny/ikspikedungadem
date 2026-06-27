/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Identitas IKS.PI Kera Sakti: Merah - Biru - Hitam - Emas
        merah: {
          DEFAULT: '#C1121F',
          dark: '#8B0000',
          light: '#E63946',
        },
        biru: {
          DEFAULT: '#1D3557',
          dark: '#102A43',
          light: '#2E5A8C',
        },
        hitam: {
          DEFAULT: '#0B0B0F',
          soft: '#16161D',
        },
        emas: {
          DEFAULT: '#D4AF37',
          dark: '#B8902A',
          light: '#F2D279',
        },
      },
      fontFamily: {
        heading: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 20px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
}
