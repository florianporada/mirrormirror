module.exports = {
  FaviconsWebpackPlugin: {
    logo: './src/images/favicon.svg',
    favicons: {
      appName: 'another-webpack-boilerplate',
      appDescription: 'Another webpack boilerplate for fast project bootstrapping',
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
