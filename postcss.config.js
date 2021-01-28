const purgecss = require('purgecss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

module.exports = (ctx) => ({
  plugins: [
    autoprefixer,
    ...(ctx.options.env === 'production'
      ? [
          cssnano({
            preset: 'default',
          }),
          purgecss({
            content: ['./**/*.html'],
            keyframes: true,
            defaultExtractor: (content) => content.match(/[A-z0-9-:/]+/g),
          }),
        ]
      : []),
  ],
});
