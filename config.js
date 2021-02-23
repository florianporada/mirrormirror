module.exports = {
  FaviconsWebpackPlugin: {
    logo: './src/images/loading-spinner.png',
    favicons: {
      appName: 'Mirror Mirror',
      appDescription: 'An empathy machine for your digital self',
      developerName: 'florianporada',
      developerURL: null, // prevent retrieving from the nearest package.json
      background: '#eeeeee',
      theme_color: '#873626',
      icons: {
        coast: false,
        yandex: false,
      },
    },
    icons: {
      twitter: true,
      windows: true,
    },
  },
};
