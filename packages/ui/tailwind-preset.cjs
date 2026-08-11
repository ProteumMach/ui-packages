const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        '3xs': ['8px', '12px'],
        '2xs': ['10px', '14px'],
      },
      margin: {
        18: '4.5rem',
      },
      height: {
        18: '4.5rem',
        120: '30rem',
        144: '36rem',
        192: '48rem',
      },
      width: {
        18: '4.5rem',
        84: '21rem',
        92: '23rem',
        120: '30rem',
        144: '36rem',
        192: '48rem',
      },
      fontFamily: {
        body: ['Open Sans', ...defaultTheme.fontFamily.sans],
        display: ['Nunito', ...defaultTheme.fontFamily.sans],
        mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: '#E07A48',
        'primary-darken': '#D6632A',
        danger: '#BA5B4B',
        'danger-darken': '#843e32',
        warning: '#FFE066',
        'warning-darken': '#CD8E04',
        info: '#6BB0B3',
        'info-lighten': '#e5f6f7',
        success: '#68B688',
        'success-darken': '#5da37a',
        yellow: '#FFCC03',
        white: '#ffffff',
        gray: {
          DEFAULT: '#4D5168',
          50: '#F3F4F6',
          100: '#DCDEE5',
          200: '#C4C7D4',
          300: '#959BB1',
          400: '#71768D',
          500: '#4D5168',
          600: '#3C4051',
          700: '#2B2E3A',
          800: '#23252F',
          900: '#1A1C23',
        },
        zinc: {
          50: '#EEEEEE',
          100: '#E1E1E1',
          200: '#C6C6C6',
          300: '#AEAEAE',
          400: '#939393',
          500: '#7B7B7B',
          600: '#626262',
          700: '#4B4B4B',
          800: '#3D3D3D',
          900: '#2F2F2F',
          950: '#282828',
        },
        tag: {
          DEFAULT: '#C4C7D4',
          blue: '#80afff',
          'light-blue': '#80d6ff',
          'sea-foam': '#91ede4',
          green: '#75e67e',
          yellow: '#fddb81',
          orange: '#ffb080',
          red: '#f2627f',
          pink: '#f695fb',
          lavender: '#ae9efa',
        },
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          width: '0',
          height: '0',
          background: 'transparent',
        },
        '.hide-scrollbar *': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar *::-webkit-scrollbar': {
          width: '0',
          height: '0',
          background: 'transparent',
        },
      })
    },
  ],
}
