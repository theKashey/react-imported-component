var importedWrapper = function(marker, realImport) {
  if (typeof __deoptimization_sideEffect__ !== 'undefined') {
    __deoptimization_sideEffect__(marker, realImport);
  }
  return realImport;
};

module.exports = importedWrapper;
