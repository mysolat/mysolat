module.exports = {
  content: [
    './app/views/**/*.{slim,erb,jbuilder,turbo_stream,js}',
    './app/decorators/**/*.rb',
    './app/helpers/**/*.rb',
    './app/inputs/**/*.rb',
    './app/assets/javascripts/**/*.js',
    './config/initializers/**/*.rb',
    './lib/components/**/*.rb'
  ],
  safelist: [
    {
      pattern: /bg-(red|green|blue|orange)-(100|200|400)/
    },
    {
      pattern: /text-(red|green|blue|orange)-(100|200|400)/
    },
    'modal-*'
  ],
  variants: {
    extend: {
      overflow: ['hover']
    }
  },
  theme: {
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square',
      roman: 'upper-roman'
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    logs: false,
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "synthwave",
      "retro",
      "garden",
      "forest",
      "aqua",
      "pastel",
      "fantasy",
      "luxury",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset"
    ]
  }
}
