const path = require("path");
const PrerenderSPAPlugin = require("prerender-spa-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new PrerenderSPAPlugin({
        staticDir: path.join(__dirname, "dist"),
        routes: ["/"],
      }),
    ],
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: "@import '@/assets/scss/index.scss';",
      },
    },
  },
};
