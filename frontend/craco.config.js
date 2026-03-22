module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "util": require.resolve("util/"),
        "fs": false,
        "path": false,
        "crypto": false,
        "stream": false,
        "assert": false,
        "os": false,
        "url": false,
        "querystring": false,
        "http": false,
        "https": false,
        "zlib": false,
      };
      return webpackConfig;
    },
  },
};