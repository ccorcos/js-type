import is from 'is-js'
import R from 'ramda'
import poly from './polymorphic'

const objOf = fn => x => is.hash(x) && R.all(fn, R.values(x))
// const objHas = fn => x => is.hash(x) && R.any(fn, R.values(x))

// define prototype for an object along with curried
// data-last functions on the type itself
//
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
        type[fname] = R.curry(fn)
        type.prototype[fname] = function(...args) {
          return fn(...args.concat([this]))
        }
      })
    },
  [is.object, objOf(objOf(is.fn))],
    (type, fns) => {
      const subtypes = R.pipe(
        R.map(R.keys),
        R.values,
        R.flatten,
        R.uniq
      )(fns)
      subtypes.forEach(subtype => {
        proto(type[subtype], R.map(R.prop(subtype), fns))
      })
      Object.keys(fns).forEach(fname => {
        const fnlen = fns[fname][subtypes[0]].length
        type.dispatch(fname, fnlen)
      })
    },
])

export default proto
