module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        "targets": {
          "chrome": "80",
          "node": "14"
        }
      }
    ],
    '@babel/preset-typescript',
  ],
};