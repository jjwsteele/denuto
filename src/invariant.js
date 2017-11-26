import getOwnPropertyDescriptors from 'core-js/library/fn/object/get-own-property-descriptors'
import cloneDeep from 'lodash.clonedeep'

const applyInvariant = (name, condition, { configurable, enumerable, value }) => {
  let _value = value
  
  return {
    configurable,
    enumerable,
    get() {
      return _value
    },
    set(newValue) {
      const thisToBe = cloneDeep(this)
      thisToBe[name] = newValue

      if (!condition(thisToBe)) {
        throw new Error('Failed postcondition')
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

const invariant = condition => target => 
  class extends target {
    constructor(...args) {
      super(...args)

      if (!condition(this)) {
        throw new Error('Failed postcondition')
      }

      applyInvariantToProperties(condition, this)
    }
  }

export default invariant
