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

Its not on NPM or anything yet. And untested. Eventually it will. For now, its just a little experiment. You help is welcome.


# Development

```bash
npm install -g xo ava
```

```bash
xo --fix
```



TODO:
- curried type constructors?
- named key-value constructors, e.g. {x:1, y:2}
- build some useful data types