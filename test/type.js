'use strict'

const test = require('ava')
const Type = require('../src/type')

test('tagged', t => {
  const Point2D = Type('Point2D', ['x', 'y'])
  const p = Point2D(1, 2)
  t.is(p.x, 1)
  t.is(p.y, 2)
  // inheritance
  t.is(p instanceof Point2D, true)
  // equals
  t.is(p.equals(Point2D(1, 2)), true)
  t.is(p.equals(Point2D(1, 3)), false)
  // dispatch prototype methods
  t.is(Point2D.equals(Point2D(1, 2), p), true)
  t.is(Point2D.equals(Point2D(1, 3), p), false)
  // dispatched methods are curried
  t.is(Point2D.equals(Point2D(1, 2))(p), true)
  // named arguments
  t.is(Point2D.toString().substr(0, 22), 'function Point2D(x,y){')
  // _fields property
  t.deepEqual(Point2D._fields, ['x', 'y'])
})

test('construct', t => {
  const Xs = Type('Xs', (x) => ({x: [x]}))
  const x = Xs(10)
  t.is(x.x[0], 10)
  // inheritance
  t.is(x instanceof Xs, true)
  // equals
  t.is(x.equals(Xs(10)), true)
  t.is(x.equals(Xs(11)), false)
  // dispatch prototype methods
  t.is(Xs.equals(Xs(10), x), true)
  t.is(Xs.equals(Xs(11), x), false)
  // dispatched methods are curried
  t.is(Xs.equals(Xs(10))(x), true)
  // named arguments
  t.is(Xs.toString().substr(0, 15), 'function Xs(x){')
  // _fields property
  t.deepEqual(Xs._fields, ['x'])
})

test('taggedSum', t => {
  const Either = Type('Either', {Left: ['x'], Right: ['x']})
  const l = Either.Left(1)
  const r = Either.Right(2)
  t.is(l.x, 1)
  t.is(r.x, 2)
  // inheritance
  t.is(l instanceof Either, true)
  t.is(r instanceof Either, true)
  t.is(l instanceof Either.Left, true)
  t.is(r instanceof Either.Right, true)
  t.is(l instanceof Either.Right, false)
  t.is(r instanceof Either.Left, false)
  // equals
  t.is(l.equals(Either.Left(1)), true)
  t.is(r.equals(Either.Right(2)), true)
  t.is(l.equals(Either.Left(2)), false)
  t.is(r.equals(Either.Right(1)), false)
  t.is(l.equals(Either.Right(1)), false)
  t.is(r.equals(Either.Left(2)), false)
  // dispatch prototype methods
  t.is(Either.equals(Either.Left(1), l), true)
  t.is(Either.equals(Either.Right(2), r), true)
  t.is(Either.equals(Either.Left(2), l), false)
  t.is(Either.equals(Either.Right(1), r), false)
  t.is(Either.equals(Either.Right(1), l), false)
  t.is(Either.equals(Either.Left(2), r), false)
  // dispatched methods are curried
  t.is(Either.equals(Either.Left(1))(l), true)
  // named arguments
  t.is(Either.Left.toString().substr(0, 24), 'function Either_Left(x){')
  t.is(Either.Right.toString().substr(0, 25), 'function Either_Right(x){')
  // _fields property
  t.deepEqual(Either.Left._fields, ['x'])
  t.deepEqual(Either.Right._fields, ['x'])
})

test('withProto', t => {
  const add1 = (a) => a + 1

  const Point2D = Type('Point2D', ['x', 'y'], {
    add: (a, b) => Point2D(a.x + b.x, a.y + b.y),
    subtract: (a, b) => Point2D(b.x - a.x, b.y - a.y)
  })
  const p1 = Point2D(1, 2)
  const p2 = Point2D(1, 1)
  t.is(p1.add(p2).equals(Point2D(2, 3)), true)
  // object-oriented way
  t.is(p1.subtract(p2).equals(Point2D(0, 1)), true)
  // functional way
  const subtractP1 = Point2D.subtract(p1)
  t.true(subtractP1(p2).equals(Point2D(0, -1)))

  const Xs = Type('Xs', (x) => ({x: [x]}), {
    map: (fn, xs) => Xs(fn(xs.x[0]))
  })
  const x = Xs(10)
  t.is(x.map(add1).equals(Xs(11)), true)
  t.is(Xs.map(add1, x).equals(Xs(11)), true)
  t.is(Xs.map(add1)(x).equals(Xs(11)), true)

  const Either = Type('Either', {Left: ['x'], Right: ['x']}, {
    map: {
      Right: (f, x) => Either.Right(f(x.x)),
      Left: (f, x) => x
    },
    ap: {
      Right: (m, mfn) => m instanceof Either.Right ? Either.Right(mfn.x(m.x)) : m,
      Left: (m, mfn) => mfn
    }
  })
  const l = Either.Left(1)
  const r = Either.Right(2)
  t.is(l.map(add1).equals(Either.Left(1)), true)
  t.is(r.map(add1).equals(Either.Right(3)), true)
  t.is(Either.map(add1, l).equals(Either.Left(1)), true)
  t.is(Either.map(add1, r).equals(Either.Right(3)), true)
  t.is(Either.map(add1)(l).equals(Either.Left(1)), true)
  t.is(Either.map(add1)(r).equals(Either.Right(3)), true)

  t.is(Either.Right(add1).ap(r).equals(Either.Right(3)), true)
  t.is(Either.Right(add1).ap(l).equals(l), true)
  t.is(Either.ap(r, Either.Right(add1)).equals(Either.Right(3)), true)
  t.is(Either.ap(l, Either.Right(add1)).equals(l), true)

  t.is(Either.Left(add1).ap(r).equals(Either.Left(add1)), true)
  t.is(Either.ap(r, Either.Left(add1)).equals(Either.Left(add1)), true)
})
