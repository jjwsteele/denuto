import isEqual from 'lodash.isequal'
import contract from './contract'

const pureContract = (pre, post) => func =>
  contract(
    pre,
    (result, args, oldArgs) => isEqual(args, oldArgs) && post && post(result, args)
  )(func)

export default pureContract
