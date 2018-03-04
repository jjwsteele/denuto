import cloneDeep from 'lodash-es/cloneDeep'
import getOwnPropertyDescriptors from './utils/getOwnPropertyDescriptors'
import { throwInvariantError } from './utils/errors'

const applyInvariant = (name, condition, { configurable, enumerable, value }) => {
  let _value = value
  
  return {
    configurable,
    enumerable,
    get() {
      return _value
    },
    set(newValue) {
      const thisToBe = cloneDeep(this, true)
      thisToBe[name] = newValue

      if (!condition(thisToBe)) {
        throwInvariantError(thisToBe)
      }

      _value = newValue

      return _value
    }
  }
}

const applyInvariantToProperties = (condition, obj) => {
  const descriptors = getOwnPropertyDescriptors(obj)

  Object.keys(descriptors).forEach(key => {
    const newDescriptor = applyInvariant(key, condition, descriptors[key])
    Object.defineProperty(obj, key, newDescriptor)
  })
}

const invariant = condition => target => {
  if (process.env.NODE_ENV !== 'production') {
    return class extends target {
      constructor(...args) {
        super(...args)

        if (!condition(this)) {
          throwInvariantError(this)
        }

        applyInvariantToProperties(condition, this)
      }
    }
  }

  return target
}

export default invariant
