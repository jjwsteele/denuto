import getTypeOfDescriptor from './utils/getTypeOfDescriptor'

const require = condition => (target, name, descriptor) => {
  if (process.env.NODE_ENV !== 'production') {
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

  return descriptor
}

export default require
