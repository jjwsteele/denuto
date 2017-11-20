import { pureContract } from '../src'

describe('pureContract', () => {
  describe('with a function that modifies its arguments', () => {
    it('throws postcondition error', () => {
      const pushOne = array => { array.push(1) }
      const pushOneWithContract = pureContract()(pushOne)
      expect(() => pushOneWithContract([2])).toThrow(/postcondition/)
    })
  })

  describe('with a function that modifies its complex arguments', () => {
    it('throws postcondition error', () => {
      const data = {
        anArray: [1, 2, 3, 4, 5, 6],
        anArrayOfObjects: [
          {
            aKey: 'aStringValue',
          },
          {
            bKey: [{}, {}, {}, {}, {}],
          },
          {
            deep: { deeper: { deepest: [1, 2, 3] } },
          },
        ],
        moreData: {},
      }
      const modifyData = data => { data.anArrayOfObjects[2].deep.deeper.deepest[2] = 4 }
      const modifyDataWithContract = pureContract()(modifyData)
      expect(() => modifyDataWithContract(data)).toThrow(/postcondition/)
    })
  })

  describe('with a pure function and additional contraints', () => {
    let sumWithContract

    beforeEach(() => {
      const sum = array => array.reduce((a, b) => a + b)
      sumWithContract = pureContract(
        array => array.every(element => element >= 0),
        (result, [array]) => result < 23 && array.every(ele => ele <= result)
      )(sum)
    })

    it('maintains behaviour of function', () => {
      expect(sumWithContract([5, 4, 3, 10, 0])).toBe(22)
    })

    it('throws an error when precondition is not met', () => {
      expect(() => sumWithContract([5, 4, -1, 0])).toThrow(/precondition/)
    })

    it('throws an error when postcondition is not met', () => {
      expect(() => sumWithContract([5, 4, 3, 10, 1])).toThrow(/postcondition/)
    })
  })

  describe('with a pure function and no postcondition', () => {
    it('maintains behaviour', () => {
      const add = (a, b) => a + b
      expect(pureContract()(add)(1, 2)).toBe(3)
    })
  })
})
