const { getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols } = Object;

const getOwnKeys = getOwnPropertySymbols
    ? object => getOwnPropertyNames(object).concat(getOwnPropertySymbols(object))
    : getOwnPropertyNames;

const getOwnPropertyDescriptors = obj =>
  getOwnKeys(obj).reduce((accum, key) => ({
    ...accum,
    [key]: getOwnPropertyDescriptor(obj, key)
  }), {}) 

export default getOwnPropertyDescriptors
