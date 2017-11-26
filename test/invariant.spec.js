import { invariant } from '../src'

describe('invariant', () => {
  describe('with a basic class', () => {
    let instance

    @invariant(curr => !curr.violation)
    class Basic {
      constructor() {
        this.existing = 0
      }

      aMethod() {
      }
    }

    beforeEach(() => {
      instance = new Basic()
    })

    it('does not stop adding new properties after creation', () => {
      instance.violation = false
      expect(instance.violation).toBe(false)
    })
    
    it('cannot ensure the invariant is held when new properties are added/modified', () => {
      instance.violation = true
      expect(instance.violation).toBe(true)
      instance.violation = 1
      expect(instance.violation).toBe(1)
    })

    it('can use new properties in invariant check when triggered', () => {
      instance.violation = true
      expect(() => instance.existing = 1).toThrow(/postcondition/)
    })
  })

  describe('with parameterless constructors', () => {
    it('does not stop non-violating constructors from creating a new object', () => {
      @invariant(curr => true)
      class NonViolating {
        constructor() {
        }
      }

      const instance = new NonViolating()
      expect(instance).toEqual({})
    })

    it('throws an error with a constructor that violates the invariant', () => {
      @invariant(curr => !curr.violation)
      class Violating {
        constructor() {
          this.violation = true
        }
      }

      expect(() => new Violating()).toThrow(/postcondition/)
    })
  })

  describe('with a constructor with parameters', () => {
    let instance

    @invariant(curr => curr.x * curr.y < 10)
    class ConstructorWithParameters {
      constructor(x, y) {
        this.x = x
        this.y = y
      }
    }
    
    it('does not stop non-violating objects to be created', () => {
      instance = new ConstructorWithParameters(3, 3)
      expect(instance).toEqual({ x: 3, y: 3})
    })

    it('throws an error when a violating object is attempted to be created', () => {
      expect(() => new ConstructorWithParameters(2, 5)).toThrow(/postcondition/)
    })
  })

  describe('with a property defined in the constructor', () => {
    let instance

    @invariant(curr => curr.aProp > 0)
    class PropDefinedInConstructor {
      constructor() {
        this.aProp = 1
      }
    }

    beforeEach(() => {
      instance = new PropDefinedInConstructor()
    })

    it('allows the property to be accessed as normal', () => {
      expect(instance.aProp).toBe(1)
    })

    it('allows the property to be set as normal', () => {
      instance.aProp = 3
      expect(instance.aProp).toBe(3)
    })

    it('throws an error when the property is set such that the invariant is not met', () => {
      expect(() => instance.aProp = 0).toThrow(/postcondition/)
    })

    it('does not set the property if the invariant will not be met', () => {
      expect(() => instance.aProp = 0).toThrow()
      expect(instance.aProp).toBe(1)
    })
  })

  describe('with a getter and setter', () => {
    let instance

    @invariant(curr => curr.fullName !== 'Jane Doe')
    class WithAGetter {
      constructor() {
        this.firstName = 'Fred'
        this.lastName = 'Durst'
      }

      get fullName() {
        return `${this.firstName} ${this.lastName}`
      }

      set fullName(value) {
        const [firstName, lastName] = value.split(' ')
        this.firstName = firstName
        this.lastName = lastName
      }
    }

    beforeEach(() => {
      instance = new WithAGetter()
    })

    it('allows the getter to be accessed as normal', () => {
      expect(instance.fullName).toBe('Fred Durst')
    })

    it('allows the setter to function as normal', () => {
      instance.fullName = 'Tom Jones'
      expect(instance.firstName).toBe('Tom')
      expect(instance.lastName).toBe('Jones')
      expect(instance.fullName).toBe('Tom Jones')
    })

    it('throws an error when the setter will cause the invariant to not be met', () => {
      expect(() => instance.fullName = 'Jane Doe').toThrow(/postcondition/)
    })

    it('does not allow the object to not violate the invariant', () => {
      expect(() => instance.fullName = 'Jane Doe').toThrow()
      expect(instance.firstName).toBe('Jane')
      expect(instance.lastName).toBe('Durst')
      expect(instance.fullName).toBe('Jane Durst')
    })
  })

  describe('with methods on the prototype', () => {
    let instance

    @invariant(curr => curr.type !== 'invalid')
    class WithMethods {
      constructor() {
        this.type = 'valid'
      }

      setTypeToInvalid() {
        this.type = 'invalid'
      }

      setTypeToValid() {
        this.type = 'valid'
      }

      setType(type) {
        this.type = type
      }

      getType() {
        return this.type
      }
    }

    beforeEach(() => {
      instance = new WithMethods()
    })

    it('does not break non-violating methods', () => {
      instance.setTypeToValid()
      expect(instance.type).toBe('valid')
    })

    it('does not break methods which take parameters', () => {
      instance.setType('also valid')
      expect(instance.type).toBe('also valid')
      instance.setType('valid')
      expect(instance.type).toBe('valid')
    })

    it('does not break methods which return a value', () => {
      expect(instance.getType()).toBe('valid')
      instance.setType('also valid')
      expect(instance.getType()).toBe('also valid')
    })

    it('throws an error when a method violates the invariant', () => {
      expect(() => instance.setTypeToInvalid()).toThrow(/postcondition/)
      expect(() => instance.setType('invalid')).toThrow(/postcondition/)
    })

    it('does not set anything if the invariant will not be met', () => {
      expect(() => instance.setTypeToInvalid()).toThrow(/postcondition/)
      expect(instance.type).toBe('valid')
    })
  })

  describe('when used on a subclass', () => {
    class SuperClass {
      constructor(violationInSuper) {
        this.violationInSuper = violationInSuper
      }

      violateSuper() {
        this.violationInSuper = true
      }
    }

    @invariant(curr => !curr.violationInSuper && !curr.violationInSub)
    class SubClass extends SuperClass {
      constructor(violationInSuper, violationInSub) {
        super(violationInSuper)
        this.violationInSub = violationInSub
      }

      violateSub() {
        this.violationInSub = true
      }
    }

    it('does not break instanceof check on superclass', () => {
      const instance = new SuperClass(false)
      expect(instance instanceof SuperClass).toBe(true)
      expect(instance instanceof SubClass).toBe(false)
    })

    it('does not break instanceof check on subclass', () => {
      const instance = new SubClass(false)
      expect(instance instanceof SuperClass).toBe(true)
      expect(instance instanceof SubClass).toBe(true)
    })

    it('does not stop creating a non-violating subclass', () => {
      const instance = new SubClass(false, false)
      expect(instance).toEqual({ violationInSuper: false, violationInSub: false })
    })

    it('does not stop creating a superclass of any kind', () => {
      const instance = new SuperClass(true)
      expect(instance).toEqual({ violationInSuper: true })
    })

    it('does not stop setting properties on a superclass instance that violate invariant', () => {
      const instance = new SuperClass(false)
      instance.violationInSuper = true
      expect(instance.violationInSuper).toBe(true)
    })

    it('does not stop methods on a superclass instance that violate the invariant', () => {
      const instance = new SuperClass(false)
      instance.violateSuper()
      expect(instance.violationInSuper).toBe(true)
    })

    it('throws an error when creating with a violation on a superclass property', () => {
      expect(() => new SubClass(true, false)).toThrow(/postcondition/)
    })

    it('throws an error when creating with a violation on a subclass property', () => {
      expect(() => new SubClass(false, true)).toThrow(/postcondition/)
    })

    it('throws an error when setting violating superclass property on subclass instance', () => {
      const instance = new SubClass(false, false)
      expect(() => instance.violationInSuper = true).toThrow(/postcondition/)
    })

    it('throws an error when violating superclass method on subclass instance is called', () => {
      const instance = new SubClass(false, false)
      expect(() => instance.violateSuper()).toThrow(/postcondition/)
    })
  })

  describe('when used on a superclass', () => {
    @invariant(curr => !curr.violationInSuper)
    class SuperClass {
      constructor(violationInSuper) {
        this.violationInSuper = violationInSuper
      }

      violateSuper() {
        this.violationInSuper = true
      }
    }

    class SubClass extends SuperClass {
      constructor(violationInSuper) {
        super(violationInSuper)
      }

      violateFromSub() {
        this.violationInSuper = true
      }
    }

    it('does not break instanceof check on superclass', () => {
      const instance = new SuperClass(false)
      expect(instance instanceof SuperClass).toBe(true)
      expect(instance instanceof SubClass).toBe(false)
    })

    it('does not break instanceof check on subclass', () => {
      const instance = new SubClass(false)
      expect(instance instanceof SuperClass).toBe(true)
      expect(instance instanceof SubClass).toBe(true)
    })

    it('does not stop creating a non-violating subclass', () => {
      const instance = new SubClass(false)
      expect(instance).toEqual({ violationInSuper: false })
    })

    it('throws an error when creating subclass that violates superclass invariant', () => {
      expect(() => new SubClass(true)).toThrow(/postcondition/)
    })

    it('throws an error when setting violating superclass property on subclass instance', () => {
      const instance = new SubClass(false)
      expect(() => instance.violationInSuper = true).toThrow(/postcondition/)
    })

    it('throws an error when violating superclass method on subclass instance is called', () => {
      const instance = new SubClass(false)
      expect(() => instance.violateSuper()).toThrow(/postcondition/)
    })

    it('throws an error when violating subclass method is called', () => {
      const instance = new SubClass(false)
      expect(() => instance.violateFromSub()).toThrow(/postcondition/)
    })
  })
})
