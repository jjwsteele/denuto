import { ensure } from '../src'

describe('ensure', () => {
  describe('with a basic method on a class', () => {
    let instance

    class Basic {
      constructor() {
        this.array = []
      }

      @ensure((curr, old) => curr.array.length < 3 && curr.array.length === old.array.length + 1)
      push(...args) {
        this.array.push(...args)
      }
    }

    beforeEach(() => {
      instance = new Basic()
    })

    it('maintains the behaviour of the method', () => {
      instance.push(1)
      expect(instance.array).toEqual([1])
    })

    it('throws an error when condition on new version of object is not met', () => {
      instance.push(1)
      instance.push(1)
      expect(() => instance.push(1)).toThrow(/postcondition/)
    })

    it('throws an error when condition between new and old version of object is not met', () => {
      expect(() => instance.push(1, 2)).toThrow(/postcondition/)
    })
  })

  describe('on a getter', () => {
    let instance

    class OnAGetter {
      constructor() {
        this.getMe = 10
      }

      @ensure(curr => curr.getMe < 21)
      get meDoubled() {
        this.getMe *= 2
        return this.getMe
      }
    }

    beforeEach(() => {
      instance = new OnAGetter()
    })

    it('maintains the behaviour of the getter', () => {
      expect(instance.meDoubled).toBe(20)
      expect(instance.getMe).toBe(20)
    })

    it('throws an error when the condition is not met', () => {
      instance.meDoubled
      expect(() => instance.meDoubled).toThrow(/postcondition/)
    })
  })

  describe('on a setter', () => {
    let instance

    class OnASetter {
      constructor() {
        this.it = 0
      }

      @ensure((curr, old, result, [newValue], [oldNewValue]) => curr.it === 10
        && old.it === 0
        && result === undefined
        && newValue === 5
        && oldNewValue === 5
      )
      set itDoubled(newValue) {
        newValue *= 2
        this.it = newValue
      }
    }

    beforeEach(() => {
      instance = new OnASetter()
    })

    it('maintains the behaviour of the setter', () => {
      instance.itDoubled = 5
      expect(instance.it).toBe(10)
    })

    it('throws an error when a condition is not met', () => {
      expect(() => instance.itDoubled = 6).toThrow(/postcondition/)
    })
  })

  describe('on a method with arguments', () => {
    let instance

    class OnAMethodWithArguments {
      @ensure((_, __, ___, [numbers], [oldNumbers]) => numbers[0] === oldNumbers[0])
      squareNumbers(numbers) {
        for (let i = 0; i < numbers.length; i++) {
          numbers[i] *= numbers[i]
        }

        return numbers
      }
    }

    beforeEach(() => {
      instance = new OnAMethodWithArguments()
    })

    it('maintains the behaviour of the method', () => {
      expect(instance.squareNumbers([1, 4, 5])).toEqual([1, 16, 25])
    })

    it('throws an error when a condition between the old and new arguments is not met', () => {
      expect(() => instance.squareNumbers([4, 4, 5])).toThrow(/postcondition/)
    })
  })

  describe('on a method that returns a value', () => {
    let instance

    class OnAMethodThatReturnsAValue {
      @ensure((_, __, result) => result < 28)
      cube(value) {
        return value * value * value
      }
    }

    beforeEach(() => {
      instance = new OnAMethodThatReturnsAValue
    })

    it('maintains the behaviour of the method', () => {
      expect(instance.cube(3)).toBe(27)
    })

    it('throws an error if a condition on the return value is not met', () => {
      expect(() => instance.cube(4)).toThrow(/postcondition/)
    })
  })

  describe('when chained on a method', () => {
    let instance

    class ChainedOnAMethod {
      constructor() {
        this.value = 0
      }

      @ensure(curr => curr.value > 5)
      @ensure(curr => curr.value < 100)
      @ensure(curr => curr.value < 10)
      setValue(value) {
        this.value = value
      }
    }

    beforeEach(() => {
      instance = new ChainedOnAMethod()
    })

    it('maintains the behaviour of the method', () => {
      instance.setValue(9)
      expect(instance.value).toBe(9)
    })

    it('throws an error when the first ensure is violated', () => {
      expect(() => instance.setValue(5)).toThrow(/postcondition/)
    })

    it('throws an error when the last ensure is violated', () => {
      expect(() => instance.setValue(10)).toThrow(/postcondition/)
    })
  })
})
