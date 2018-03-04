import cloneDeep from 'lodash-es/cloneDeep'
import getTypeOfDescriptor from './utils/getTypeOfDescriptor'

const ensure = condition => (target, name, descriptor) => {
  if (process.env.NODE_ENV !== 'production') {
    const type = getTypeOfDescriptor(descriptor)

    return {
      ...descriptor,
      [type]: function(...args) {
        const old = cloneDeep(this, true)
        const oldArgs = cloneDeep(args, true)
        const result = descriptor[type].apply(this, args)

        if (!condition(this, old, result, args, oldArgs)) {
          throw new Error('Failed postcondition')
        }

        return result
      }
    }
  }

  return descriptor
}

export default ensure
