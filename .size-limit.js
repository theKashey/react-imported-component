module.exports = [
  {
    path: ['dist/es2015/entrypoints/index.js', 'dist/es2015/entrypoints/boot.js'],
    ignore: ['tslib'],
    limit: '3.7 KB',
  },
  {
    path: 'dist/es2015/entrypoints/index.js',
    ignore: ['tslib'],
    limit: '3.5 KB',
  },
  {
    path: 'dist/es2015/entrypoints/boot.js',
    ignore: ['tslib'],
    limit: '1.9 KB',
  },
];
