module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude mongoose browser bundle from client-side build
      config.externals = ["mongoose"];
    }

    return config;
  }
};
