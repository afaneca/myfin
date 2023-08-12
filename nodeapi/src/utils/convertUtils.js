const ConvertUtils = {
  convertFloatToBigInteger: (floatVal) => parseInt((floatVal * 100).toFixed(2), 10),
  convertBigIntegerToFloat: (intVal) => parseFloat(intVal / 100).toFixed(2),
};

export default ConvertUtils;
