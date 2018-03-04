const outputValues = values => Object.keys(values).reduce((acc, name) =>
  `${acc}  '${name}': ${JSON.stringify(values[name])}\n`,
  '\n'
)

const throwPreconditionError = (fn, values) => {
  throw new Error(`Failed precondition for '${fn.name}':${outputValues(values)}`)
}

const throwPostconditionError = (fn, values) => {
  throw new Error(`Failed postcondition for '${fn.name}':${outputValues(values)}`)
}

const throwInvariantError = obj => {
  const values = Object.getOwnPropertyNames(obj).reduce(
    (acc, name) => ({ ...acc, [name]: obj[name] }), {}
  )
  throw new Error(`Failed invariant for '${obj.constructor.name}':${outputValues(values)}`)
}

export {
  throwPreconditionError,
  throwPostconditionError,
  throwInvariantError,
}
