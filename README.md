# JavaScript Types

The goal of this project is to bring functional types to JavaScript without having to touch all that nasty `this`, `new` and `prototype` business.

It's pretty simple:

```js
const Point = Type('Point', ['x', 'y'], {
  // this always comes last
  concat: (a, b) => b.concat(a)
})

Point(1, 1).concat(Point(1, 2)) // => Point(2, 3)
Point.add(Point(1, 1), Point(1, 2)) // => Point(2, 3)

const Maybe = Type('Maybe', {
  Just: ['x'],
  Nothing: []
}, {
  map: {
    Just: (f, x) => Maybe.Just(f(x.value)),
    Nothing: (f, x) => x,
  }
})

Maybe.Just(1).map(x => x + 1) // Maybe.Just(2)
Maybe.Nothing().map(x => x + 1) // Maybe.Nothing()

```