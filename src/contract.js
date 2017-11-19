import cloneDeep from 'lodash.clonedeep'

const preConditionErrorMsg = (func, args) =>
  `Failed precondition for '${func.name}':
    args: '${args}'`

const postConditionErrorMsg = (func, result, args, oldArgs) =>
  `Failed postcondition for '${func.name}':
    result: '${result}'
    args: '${args}'
    oldArgs: '${oldArgs}'`

const contract = (pre, post) => func => (...args) => {
  if (pre && !pre(...args)) {
    throw new Error(preConditionErrorMsg(func, args))
  }

  const oldArgs = cloneDeep(args)
  const result = func(...args)

  if (post && !post(result, args, oldArgs)) {
    throw new Error(postConditionErrorMsg(func, result, args, oldArgs))
  }

  return result
}

export default contract
