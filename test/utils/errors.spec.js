import {
  throwPreconditionError,
  throwPostconditionError,
  throwInvariantError,
} from '../../src/utils/errors'

describe('errors', () => {
  describe('throwPreconditionError', () => {
    it('throws an error with the correct message', () => {
      const fn = () => true
      const values = {
        args: [1, 2, 3],
        object: {
          a: 1,
          b: 2,
        },
        result: true,
      }
      const expectedErrorMsg = `Failed precondition for 'fn':\n  'args': [1,2,3]\n  'object': {"a":1,"b":2}\n  'result': true`
      expect(() => throwPreconditionError(fn, values)).toThrow(expectedErrorMsg)
    })
  })
  
  describe('throwPostconditionError', () => {
    it('throws an error with the correct message', () => {
      const fn = () => true
      const values = {
        args: [1, 2, 3],
        object: {
          a: 1,
          b: 2,
        },
        result: true,
      }
      const expectedErrorMsg = `Failed postcondition for 'fn':\n  'args': [1,2,3]\n  'object': {"a":1,"b":2}\n  'result': true`
      expect(() => throwPostconditionError(fn, values)).toThrow(expectedErrorMsg)
    })
  })
  
  describe('throwInvariantError', () => {
    it('throws an error with the correct message', () => {
      class Hello {
        constructor() {
          this.test1 = true
          this.test2 = {
            a: 1,
            b: 2,
          }
        }
      }
      const instance = new Hello()
      const expectedErrorMsg = `Failed invariant for 'Hello':\n  'test1': true\n  'test2': {"a":1,"b":2}`
      expect(() => throwInvariantError(instance)).toThrow(expectedErrorMsg)
    })
  })
})
