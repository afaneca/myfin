const ConvertUtils = {
  convertFloatToBigInteger: (floatVal: any) => Number(parseInt((floatVal * 100).toFixed(2), 10)),
  convertBigIntegerToFloat: (intVal: bigint) => +(parseFloat(String(intVal)) / 100).toFixed(2),
};

export default ConvertUtils;
