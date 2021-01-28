module.exports = {
  FaviconsWebpackPlugin: {
    logo: './src/images/favicon.svg',
    favicons: {
      appName: 'MirrorMirror',
      appDescription: 'VR inner body experience',
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
