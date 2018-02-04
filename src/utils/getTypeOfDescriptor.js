const getTypeOfDescriptor = ({ value, get, set }) => {
  if (value) {
    return 'value'
  } else if (get) {
    return 'get'
  }

  return 'set'
}

export default getTypeOfDescriptor
