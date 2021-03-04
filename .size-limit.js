module.exports = [
  {
    path: ['dist/es2015/entrypoints/index.js', 'dist/es2015/entrypoints/boot.js'],
    ignore: ['tslib'],
    limit: '4.1 KB',
  },
  {
    path: 'dist/es2015/entrypoints/index.js',
    ignore: ['tslib'],
    limit: '3.8 KB',
  },
  {
    path: 'dist/es2015/entrypoints/boot.js',
    ignore: ['tslib'],
    limit: '1.9 KB',
  },
];
