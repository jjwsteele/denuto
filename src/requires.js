import getTypeOfDescriptor from './utils/getTypeOfDescriptor'
import { throwPreconditionError } from './utils/errors'

const requires = condition => (target, name, descriptor) => {
  if (process.env.NODE_ENV !== 'production') {
    const type = getTypeOfDescriptor(descriptor)

    return {
      ...descriptor,
      [type]: function(...args) {
        if (!condition(this, args)) {
          throwPreconditionError(descriptor[type], { 'this': this, args })
        }

        return descriptor[type].apply(this, args)
      }
    }
  }

  return descriptor
}

export default requires
