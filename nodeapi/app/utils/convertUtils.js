const ConvertUtils = {
  convertFloatToBigInteger: (floatVal) => parseInt(floatVal * 100, 10),
  convertBigIntegerToFloat: (intVal) => parseFloat(intVal / 100),
};

export default ConvertUtils;
