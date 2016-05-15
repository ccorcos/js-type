# JavaScript Types

![travis-ci](https://travis-ci.org/ccorcos/js-type.svg?branch=master)

The goal of this project is to bring types to JavaScript without having to touch all that nasty `this`, `new` and `prototype` business.

It's pretty simple:

The first argument is the name of the type. We'll create a named function so its easy to inspect what type you're dealing with in the console.

The second argument is either an array, an object, or a function. If its an array, it needs to be an array of strings. These will be the property names of the arguments passed into the constructor. If its an object, then we're creating a sum-type, like an Either or a Maybe. If its a function, then its a constructor function that takes a value and returns a plain object who's properties will get assigned to the type.

The third argument is optional and is a plain object of prototype methods where the `this` is the last argument. It creates curried versions of the function on the type constructor along with prototype methods on the type.

## Examples

```js
const Point = Type('Point', ['x', 'y'], {
  // this always comes last
  add: (a, b) => Point(b.x + a.x, b.y + a.y),
  subtract: (a, b) => Point(b.x - a.x, b.y - a.y)
})

Point(1, 1).add(Point(1, 2)) // => Point(2, 3)
Point.add(Point(1, 1), Point(1, 2)) // => Point(2, 3)

Point.equals(Point(1, 1), Point(1, 1)) // => true
Point(1, 1).equals(Point(1, 1)) // => true

Point(1, 1).inspect() // => "Point(1, 1)"
Point.inspect(Point(1, 1)) // => "Point(1, 1)"

Point(1, 2).subtract(Point(1, 1)) // => Point(0, 1)
subtract11 = Point.subtract(Point(1, 1))
subtract11(Point(1, 2)) // => Point(0, 1)

const Maybe = Type('Maybe', {
  Just: ['value'],
  Nothing: []
}, {
  map: {
    Just: (f, x) => Maybe.Just(f(x.value)),
    Nothing: (f, x) => x,
  }
})

const add1 = x => x + 1
Maybe.Just(1).map(add1) // Maybe.Just(2)
Maybe.map(add1, Maybe.Just(1)) // Maybe.Just(2)
Maybe.map(add1)(Maybe.Just(1)) // Maybe.Just(2)

Maybe.map(add1, Maybe.Nothing()) // Maybe.Nothing()
Maybe.map(add1)(Maybe.Nothing()) // Maybe.Nothing()
Maybe.Nothing().map(add1) // Maybe.Nothing()

const FunkyType = Type('FunkyType', (a,b) => {sum: a+b, diff: a-b})
```

# Contributing

## To Do

- `.inspect` for types defined with an anonymous constructor function
- curried type constructors
- key-value constructors for tagged types, e.g. Point({x:1, y:2})
- build and test some useful data-types

# Development

```bash
# global dependencies
npm install -g xo ava
# fixing up linting errors
xo --fix
# test
npm test
```
