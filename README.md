# Denuto

Denuto enables design by contract (DbC) programming in JavaScript. It provides four different ways to specify contracts:

* `contract` - a higher order function,
* `invariant` - a class decorator,
* `requires` - a property decorator,
* `ensures` - a property decorator

Denuto throws run-time errors when contracts are violated in development. Design by contract can provide a number of advantages:

* document behaviour inline with the defintition,
* reduce sanity check tests,
* reduce need for defensive programming,
* encourage developers to think about the domain

However, it is not the solution for everything. It is not a replacement for testing, contracts can only specify general rules, not specific cases. It also tends to work best when dealing with domain logic. For example, it is more effective for specifying invariants in state, than the contract for a rendering function.

NOTE: *Similary to [core-decorators][core-decorators], this library makes use of stage-0 decorators. The spec has changed since moving to stage-2, and transpilers are yet to implement the changes. The implementation of this library will likely have to change, but hopefully not the interface. Regardless, this project will not go to 1.0 until then. I recommend locking your dependency to PATCH.*

## DbC Resources

* [Wikibooks][wikibooks],
* [Eiffel introduction][eiffel-introduction],
* [gcontracts for Groovy introduction][gcontracts-introduction],
* [C2 Wiki][c2-wiki-introduction]

## Getting Started

Install via NPM:
```
npm install --save denuto
```

Using:
```javascript
import { contract, invariant, requires, ensures } from 'denuto'

const findIndex = (array, toFind) => array.findIndex(item => item === toFind)
const contractedFindIndex = contract({
  pre: array => array.length < 100,
  post: (result, [array, toFind]) => array[result] === toFind
})(findIndex)

@invariant(self => self.on || !self.on && self.speed === 0)
class Car {
  constructor() {
    this.on = false
    this.speed = 0
  }

  @requires(self => !self.on)
  turnOn() {
    this.on = true
  }

  @requires(self => self.on)
  @ensures((self, old) => self.speed > old.speed)
  accelerate() {
    this.speed += 5
  }

  @ensures((self, old) => self.speed < old.speed)
  break() {
    this.speed -= 0
  }

  @requires(self => self.on && self.speed === 0)
  turnOff() {
    this.on = false
  }
}
```

## Reference

#### contract(conditions)

Returns a higher-order function that can be applied to existing functions to add pre and post condition checking.

* `conditions` *(Object)*
  * [`pre(...args)`] *(function)*: If specified, will be called before contracted function is executed with the arguments to the contracted function. If `pre` returns false, then a precondition error will be thrown.
  * [`post(result, args, oldArgs)`] *(function)*: If specified, will be called after contracted function is executed with the result, the arguments after execution, and the arguments before execution. If `post` returns false, then a postcondition error will be thrown.

#### @invariant(condition)

A class decorator for specifying conditions that must remain true at all times.

* `condition(self)` *(function)*: Will be called with a copy of the object before and after every property of the class is accessed. If `condition` returns false, then a invariant error will be thrown. *Note: invariant checking is applied for all properties declared on the class or initialised in the constructor, and not for properties added later.*

#### @requires(condition)

A property decorator for specifying preconditions on access to a property. Can be applied to value, method, getter or setter properties.

* `condition(self, args)` *(function)*: Will be called with a copy of the object and arguments before the property is accessed. If `condition` returns false, then a precondition error will be thrown.

#### @ensures(condition)

A property decorator for specifying postconditions on access to a property. Can be applied to value, method, getter or setter properties.

* `condition(self, old, result, args, oldArgs)` *(function)*: Will be called with the object after execution, a copy of the object before execution, the returned value, the arguments after execution and a copy of the arguments before execution. If `condition` returns false, then a postcondition error will be thrown.

## In Production

Due to conditions not being checked whilst running in production, it also makes sense to strip out as much of Denuto as possible to reduce on build sizes. All of Denuto's checking is wrapped in:

```javascript
if (process.env.NODE_ENV !== 'production') {
  // do checking
}
```

You can use Webpack's [DefinePlugin][DefinePlugin] or Rollup's [rollup-plugin-replace][rollupreplace], to replace instances of 'process.env.NODE_ENV' with `'production'`. This should result in almost all of Denuto being stripped out.

## License
MIT

[DefinePlugin]: https://webpack.js.org/plugins/define-plugin/
[rollupreplace]: https://github.com/rollup/rollup-plugin-replace
[core-decorators]: https://github.com/jayphelps/core-decorators
[wikibooks]: https://en.wikibooks.org/wiki/Computer_Programming/Design_by_Contract
[eiffel-introduction]: https://www.eiffel.com/values/design-by-contract/introduction/
[gcontracts-introduction]: https://github.com/andresteingress/gcontracts/wiki/An-Introduction-to-Programming-by-Contract
[c2-wiki-introduction]: http://wiki.c2.com/?DesignByContract
