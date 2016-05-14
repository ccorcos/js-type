'use strict'

const is = require('is-js')
const all = require('ramda/src/all')
const equals = require('ramda/src/equals')
const curryN = require('ramda/src/curryN')
const poly = require('./polymorphic')
const proto = require('./prototype')
const nfn = require('./named-function')

// automagically create .equals and .toString
// ```js
// p.equals(Point2D(1, 2))
// > true
// p.equals(Point2D(2, 2))
// > false
// p.toString()
// > "Point(1, 2)"
// ```
const defaultProto = (type) => {
  proto(type, {
    equals: (a, b) => a._name === b._name && all(k => equals(a[k], b[k]), type._fields),
    toString: (x) => `${type._name}(${type._fields.map((y) => x[y].toString()).join(', ')})`
  })
}

// the following makes `type instanceof parent === true`
const inherit = (parent, type) => {
  const prev = type.prototype
  type.prototype = Object.create(parent.prototype)
  Object.assign(type.prototype, prev)
}

// Parse a function's argument names.
// ```js
// fnArgNames((a,b,c) => a + b + c)
// > ['a', 'b', 'c']
// ```
const fnArgNames = (fn) => {
  const s = fn.toString()
  const x1 = s.indexOf('(')
  const x2 = s.indexOf(')')
  const args = s.substr(x1 + 1, x2 - x1 - 1).split(',')
  return args
}

// Construct a type given a name and a function to generate properties
// ```js
// const Error = construct('Error', (x) => {x: [x]})
// const e = Error(10)
// e.x[0]
// > 10
// ```
const construct = (name, fn) => {
  const argNames = fnArgNames(fn)
  // create a named function -- useful for debugging in console
  const type = nfn(name, argNames, function () {
    const args = Array.from(arguments)
    // don't require new for constructing because that's lame
    if (!(this instanceof type)) {
      return new (Function.prototype.bind.apply(type, [null].concat(args)))
    }
    const props = fn.apply(null, args)
    type._name = name
    this._name = name
    type._fields = Object.keys(props)
    Object.assign(this, props)
  })
  // automatically create .toString and .equals
  defaultProto(type)
  return type
}

// Construct a simple type with a name and some named properties.
//
// ```js
// const Point2D = tagged('Point2D', ['x', 'y'])
// const p = Point2D(1, 2)
// p.x
// > 1
// p.y
// > 2
// ```
const tagged = (name, fields) => {
  // create a named function -- useful for debugging in console
  const type = nfn(name, fields, function () {
    const args = Array.from(arguments)
    // don't require new for constructing because that's lame
    if (!(this instanceof type)) {
      return new (Function.prototype.bind.apply(type, [null].concat(args)))
    }
    // check you get the right number of args like it the wild west
    if (args.length !== fields.length) {
      throw new TypeError(`Expected ${fields.length} arguments, got ${args.length}.`)
    }
    // assign args to fields
    for (let i = 0; i < fields.length; i++) {
      this[fields[i]] = args[i]
    }
    type._name = name
    this._name = name
    type._fields = fields
  })
  // automatically create .toString and .equals
  defaultProto(type)
  return type
}

// disjointed types / union types / sum types
// ```js
// const Either = taggedSum('Maybe', {Left:['x'], Right:['x']})
// const l = Either.Left(1)
// const r = Either.Right(2)
// l.toString()
// > "Maybe_Left(1)"
// l instanceof Maybe
// > true
// l instanceof Maybe.Left
// > true
// l instanceof Maybe.Right
// > false
// l.equals(r)
// > false
// Maybe.equals(l, Maybe.Left(1))
// > true
// ```
const taggedSum = (name, obj) => {
  // also a named function
  const type = nfn(name, [], function () {
    throw new TypeError(`${name} was called instead of one of its properties.`)
  })
  // create each subtype
  for (const key in obj) {
    const ctor = Type(`${name}_${key}`, obj[key])
    inherit(type, ctor)
    type[key] = ctor
    // since we don't have pattern matching, we need comparators
    type[`is${key}`] = (x) => x instanceof ctor
    type[key].prototype[`is${key}`] = true
  }
  // might be useful to have someday
  type._subtypes = Object.keys(obj)
  // use this method to delegate to its children types
  type.dispatch = (fname, len) => {
    type[fname] = curryN(len, function () {
      const args = Array.from(arguments)
      return args[len - 1][fname].apply(args[len - 1], args.slice(0, len - 1))
    })
  }
  type.dispatch('equals', 2)
  type.dispatch('toString', 1)
  return type
}

// we can construct a type with prototype methods
const withProto = (fn) => function () {
  const args = Array.from(arguments)
  const t = fn.apply(null, args.slice(0, 2))
  proto(t, args[2])
  return t
}

const Type = poly([
  [is.string, is.array], tagged,
  [is.string, is.fn], construct,
  [is.string, is.hash], taggedSum,
  [is.string, is.array, is.hash], withProto(tagged),
  [is.string, is.fn, is.hash], withProto(construct),
  [is.string, is.hash, is.hash], withProto(taggedSum)
])

module.exports = Type

// ```js
// // Fantasy Land

// const methods = {
//   Setoid: ['equals'],
//   Semigroup: ['concat'],
//   Monoid: ['empty'],
//   Functor: ['map'],
//   Apply: ['ap'],
//   Applicative: ['of'],
//   Foldable: ['reduce'],
//   Traversable: ['sequence'],
//   Chain: ['chain'],
//   Monad: ['map', 'of'],
//   Extend: ['extend'],
//   Comonad: ['extract'],
// }

// const derivable = {
//   Monad: {
//     ap: (mfn, m) => mfn.chain(f => m.map(f)),
//     map: (f, m) => m.chain(a => m.of(f(a))),
//   },
//   Applicative: {
//     map: (f, m) => m.of(f).ap(this),
//   },
//   Foldable: {
//     toArray: (m) => m.reduce((acc, x) => acc.concat([x]), [])
//   },
//   Traversable: {
//     traverse: (f, m_of, m)  => m.map(f).sequence(m_of)
//   }
// }
// ```
