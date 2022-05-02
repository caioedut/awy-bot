module.exports = {
  semi: true,
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'all',
  endOfLine: 'auto',
  importOrder: ['^react(.*)$', '^@unform/(.*)$', '^@mui/(.*)$', '/config(.*)$', '(.*).css$', '^[./]'],
  importOrderSeparation: true,
  experimentalBabelParserPluginsList: ['classProperties', 'jsx', 'typescript'],
};
