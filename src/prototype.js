'use strict'

const is = require('is-js')
const all = require('ramda/src/all')
// const any = require('ramda/src/any')
const curry = require('ramda/src/curry')
const values = require('ramda/src/values')
const pipe = require('ramda/src/pipe')
const map = require('ramda/src/map')
const prop = require('ramda/src/prop')
const keys = require('ramda/src/keys')
const flatten = require('ramda/src/flatten')
const uniq = require('ramda/src/uniq')
const poly = require('./polymorphic')

// some helpful type checkers
const objOf = fn => x => is.hash(x) && all(fn, values(x))
// const objHas = fn => x => is.hash(x) && any(fn, values(x))

// define prototype for an object along with curried
// data-last functions on the type itself
// ```js
// const F = Type('F', ['x'])
// proto(F, {map: (f, x) => F(f(x.x))})
// const f = F(1)
// f.map(i => i + 1).equals(F(2))
// > 2
// F.map(i => i + 1, f).equals(F(2))
// > 2
// const E = Type('E', {L:['x'],R:['x']})
// proto(E, {
//   map: {
//     L: (f, x) => L.E(x.x)),
//     R: (f, x) => E.R(f(x.x)),
//   }
// })
// E.L(1).map(i => i + 1).equals(E.L(1))
// > true
// E.R(1).map(i => i + 1).equals(E.R(2))
// > true
// E.equals(
//   E.map(i => i + 1, E.L(1)),
//   E.L(1)
// )
// > true
// E.equals(
//   E.map(i => i + 1, E.R(1)),
//   E.R(2)
// )
// > true
// ```
const proto = poly([
  [is.object, objOf(is.fn)],
  (type, fns) => {
    Object.keys(fns).forEach(fname => {
      const fn = fns[fname]
        // data comes last
      type[fname] = curry(fn)
      type.prototype[fname] = function () {
        const args = Array.from(arguments)
        return fn.apply(null, args.concat([this]))
      }
    })
  },
  [is.object, objOf(objOf(is.fn))],
  (type, fns) => {
    const subtypes = pipe(map(keys), values, flatten, uniq)(fns)
    subtypes.forEach(subtype => {
      proto(type[subtype], map(prop(subtype), fns))
    })
    Object.keys(fns).forEach(fname => {
      const fnlen = fns[fname][subtypes[0]].length
      type.dispatch(fname, fnlen)
    })
  },
])

module.exports = proto
