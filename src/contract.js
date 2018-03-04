import cloneDeep from 'lodash-es/cloneDeep'
import { throwPreconditionError, throwPostconditionError } from './utils/errors'

const contract = ({ pre, post }) => func => (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    if (pre && !pre(...args)) {
      throw new Error(throwPreconditionError(func, { args }))
    }

    const oldArgs = cloneDeep(args)
    const result = func(...args)

    if (post && !post(result, args, oldArgs)) {
      throw new Error(throwPostconditionError(func, { result, args, oldArgs }))
    }

    return result
  }

  return func(...args)
}

export default contract
