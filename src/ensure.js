import cloneDeep from 'lodash.clonedeep'
import getTypeOfDescriptor from './getTypeOfDescriptor'

const ensure = condition => (target, name, descriptor) => {
  const type = getTypeOfDescriptor(descriptor)

  return {
    ...descriptor,
    [type]: function(...args) {
      const old = cloneDeep(this)
      const oldArgs = cloneDeep(args)
      const result = descriptor[type].apply(this, args)

      if (!condition(this, old, result, args, oldArgs)) {
        throw new Error('Failed postcondition')
      }

      return result
    }
  }
}

export default ensure
