import { require } from '../src'

describe('require', () => {
  describe('with a basic method on a class', () => {
    let instance

    class Basic {
      constructor() {
        this.canRunMethod = true
      }

      @require(curr => curr.canRunMethod)
      aMethod() {
      }
    }

    beforeEach(() => {
      instance = new Basic()
    })

    it('does not stop the method from running', () => {
      instance.aMethod()
    })

    it('throws an error when the condition is not met', () => {
      instance.canRunMethod = false
      expect(() => instance.aMethod()).toThrow(/precondition/)
    })
  })

  describe('on a getter', () => {
    let instance

    class OnAGetter {
      constructor() {
        this.getMe = 10
      }

      @require(curr => curr.getMe < 11)
      get meDoubled() {
        return this.getMe * 2
      }
    }

    beforeEach(() => {
      instance = new OnAGetter()
    })

    it('maintains the behaviour of the getter', () => {
      expect(instance.meDoubled).toBe(20)
    })

    it('throws an error when condition is not met', () => {
      instance.getMe = 11
      expect(() => instance.meDoubled).toThrow(/precondition/)
    })
  })

  describe('on a setter', () => {
    let instance

    class OnASetter {
      constructor() {
        this.it = 29
      }

      @require((curr, [newValue]) => curr.it < 30 && newValue < 10)
      set itDoubled(newValue) {
        this.it = newValue * 2
      }
    }

    beforeEach(() => {
      instance = new OnASetter()
    })

    it('maintains the behaviour of the setter', () => {
      instance.itDoubled = 9
      expect(instance.it).toBe(18)
    })

    it('throws an error when a condition on the object is not met', () => {
      instance.it = 30
      expect(() => instance.itDoubled = 1).toThrow(/precondition/)
    })

    it('throws an error when a condition on the argument is not met', () => {
      expect(() => instance.itDoubled = 10).toThrow(/precondition/)
    })
  })

  describe('on a method with arguments', () => {
    let instance

    class OnAMethodWithArguments {
      constructor() {
        this.summed = 0
      }

      @require((curr, [a, b, c, d, e]) => curr.summed < a && a < e)
      sum(a, b, c, d, e) {
        this.summed = a + b + c + d + e
      }
    }

    beforeEach(() => {
      instance = new OnAMethodWithArguments()
    })

    it('maintains the behaviour of the method', () => {
      instance.sum(1, 2, 3, 4, 5)
      expect(instance.summed).toBe(15)
    })

    it('throws an error when a condition on the arguments is not met', () => {
      expect(() => instance.sum(3, 1, 1, 1, 2)).toThrow(/precondition/)
    })

    it('throws an error when a condition between the arguments and the object is not met', () => {
      expect(() => instance.sum(-1, 2, 3, 4, 5)).toThrow(/precondition/)
    })
  })

  describe('on a method that returns a value', () => {
    it('maintains the behaviour of the method', () => {
      class OnAMethodThatReturnsAValue {
        @require(() => true)
        returnTen() {
          return 10
        }
      }

      const instance = new OnAMethodThatReturnsAValue()
      expect(instance.returnTen()).toBe(10)
    })
  })
  
  describe('when chained on a method', () => {
    let instance

    class ChainedOnAMethod {
      constructor() {
        this.summed = 0
      }

      @require(curr => curr.summed < 5)
      @require((curr, [arg]) => arg < 10)
      @require((curr, [arg]) => curr.summed < arg)
      chained(arg) {
        this.summed = arg
      }
    }

    beforeEach(() => {
      instance = new ChainedOnAMethod()
    })

    it('maintains the behaviour of the method', () => {
      instance.chained(9)
      expect(instance.summed).toBe(9)
    })

    it('throws an error when the first require is violated', () => {
      instance.summed = 5
      expect(() => instance.chained(9)).toThrow(/precondition/)
    })

    it('throws an error when the last require is violated', () => {
      expect(() => instance.chained(0)).toThrow(/precondition/)
    })
  })
})
