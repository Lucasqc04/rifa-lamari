/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
  50:  '#eae0cf',  // bege queimado
    100: '#d9c5a4',  // areia escura
    200: '#c0a174',  // caramelo queimado
    300: '#a67e4d',  // marrom claro
    400: '#8c5f2e',  // marrom médio
    500: '#774619',  // marrom forte
    600: '#663a14',  // marrom escuro
    700: '#532e10',  // bem escuro
    800: '#3f210c',  // quase chocolate amargo
    900: '#2a1607',  // profundo e discreto
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
