module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: false,
      preload: 'src/preload.js',
      mainProcessFile: 'src/electron.js',
      rendererProcessFile: 'src/index.js',
      mainProcessWatch: [
        'src/electron.js',
        'src/preload.js',
      ],
      builderOptions: {
        extraMetadata: {
          // fixes a bug when building the app
          "main": "background.js",
        },
      },
    },
  },
}