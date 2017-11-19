import { contract } from '../src'

const numbers = [43, 53, 23, 76, 45, 87, 44]
const tenNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const is23 = element => element === 23
const lengthLessThan10 = array => array.length < 10
const findIndex = (array, callback) => array.findIndex(callback)
const push = (array, element) => array.push(element)
const sort = array => array.sort()
const reverseInPlace = array => { array.reverse() }
const sortedNumbers = sort([...numbers])
const indexOfTwentyThree = findIndex(numbers, is23)

describe('contract', () => {
  describe('with no arguments', () => {
    it('maintains behaviour of function', () => {
      const sortWithEmptyContract = contract()(sort)
      expect(sortWithEmptyContract([...numbers])).toEqual(sortedNumbers)
      expect(sort([...numbers])).toEqual(sortedNumbers)
    })
  })

  describe('with just a pre condition', () => {
    let sortWithContract

    beforeEach(() => {
      sortWithContract = contract(lengthLessThan10)(sort)
    })

    it('maintains behaviour of function', () => {
      expect(sortWithContract([...numbers])).toEqual(sortedNumbers)
      expect(sort([...numbers])).toEqual(sortedNumbers)
    })

    it('throws an error when precondition is not met', () => {
      expect(() => sortWithContract([...tenNumbers])).toThrow(/precondition/)
    })
  })

  describe('with just a post condition', () => {
    const sortPostCondition =
      (result, _, [oldArray]) => result.length === oldArray.length
      && result.every((element, i) => i == 0 || element >= result[i - 1])

    it('maintains behaviour of function', () => {
      const sortWithContract = contract(null, sortPostCondition)(sort)
      expect(sortWithContract([...numbers])).toEqual(sortedNumbers)
      expect(sort([...numbers])).toEqual(sortedNumbers)
    })

    it('throws an error when postcondition is not met', () => {
      const badSort = () => tenNumbers
      const badSortWithContract = contract(null, sortPostCondition)(badSort)
      expect(() => badSortWithContract([...numbers])).toThrow(/postcondition/)
    })
  })

  describe('with both pre and post conditions', () => {
    let findIndexWithContract

    beforeEach(() => {
      findIndexWithContract = contract(
        lengthLessThan10,
        (result, [array, callback]) => callback(array[result])
      )(findIndex)
    })

    it('maintains behaviour of function', () => {
      expect(findIndexWithContract(numbers, is23)).toBe(indexOfTwentyThree)
      expect(findIndex(numbers, is23)).toBe(indexOfTwentyThree)
    })

    it('throws an error when precondition is not met', () => {
      expect(() => findIndexWithContract(tenNumbers, is23)).toThrow(/precondition/)
    })

    it('throws an error when postcondition is not met', () => {
      expect(() => findIndexWithContract(numbers, () => false)).toThrow(/postcondition/)
    })

    it('throws precondition error when both pre and post conditions are not met', () => {
      expect(() => findIndexWithContract(tenNumbers, () => false)).toThrow(/precondition/)
    })
  })

  describe('when called with a function which modifies its own arguments', () => {
    it('allows comparison of the original arguments with the arguments after execution', () => {
      const pushWithContract = contract(
        null,
        (result, [array, element], [oldArray]) =>
          array.length - oldArray.length === 1
          && array[array.length - 1] === element
          && result === array.length
      )(push)

      expect(pushWithContract([...tenNumbers], 5)).toBe(11)
    })
  })

  describe('when called with a function which returns nothing', () => {
    it('calls postcondition with undefined as first argument', () => {
      const tenNumbersReversed = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      const mockFn = jest.fn().mockImplementation(() => true)
      const reverseInPlaceWithContract = contract(null, mockFn)(reverseInPlace)
      reverseInPlaceWithContract([...tenNumbers])
      expect(mockFn).toHaveBeenCalledWith(undefined, [tenNumbersReversed], [tenNumbers])
    })
  })
})
