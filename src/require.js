const getTypeOfDescriptor = ({ value, get, set }) => {
  if (value) {
    return 'value'
  } else if (get) {
    return 'get'
  }

  return 'set'
}

const require = condition => (target, name, descriptor) => {
  const type = getTypeOfDescriptor(descriptor)

  return {
    ...descriptor,
    [type]: function(...args) {
      if (!condition(this, args)) {
        throw new Error('Failed precondition')
      }
      
      return descriptor[type].apply(this, args)
    }
  }
}

export default require
