module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: 'ant-design-vue',
        libraryDirectory: 'es',
        style: 'css', // 如果使用 less，可以改为 'less'
      },
    ],
  ],
};
