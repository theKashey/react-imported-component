module.exports = [
  {
    path: ['dist/es2015/entrypoints/index.js', 'dist/es2015/entrypoints/boot.js'],
    ignore: ['tslib'],
    limit: '3.4 KB',
  },
  {
    path: 'dist/es2015/entrypoints/index.js',
    ignore: ['tslib'],
    limit: '3.1 KB',
  },
  {
    path: 'dist/es2015/entrypoints/boot.js',
    ignore: ['tslib'],
    limit: '1.8 KB',
  },
];
