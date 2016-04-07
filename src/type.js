import R from 'ramda'
import is from 'is-js'
import poly from './polymorphic'
import proto from './prototype'
import nfn from './named-function'

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
    equals: (a, b) => R.all(k => R.equals(a[k], b[k]), type._fields),
    toString: (x) => `${name} (${type._fields.map((y) => x[y].toString()).join(', ')})`,
  })
}

// the following makes `x instanceof ParentType = true`
const inherit = (parent, type) => {
  const prev = type.prototype
  type.prototype = Object.create(parent.prototype)
  Object.assign(type.prototype, prev)
}

// ```js
// const Error = construct('Error', (x) => {x: [x]})
// const e = Error(10)
// e.x[0]
// > 0
// ```
const construct = (name, fn) => {
  const s = fn.toString()
  const x1 = s.indexOf('(')
  const x2 = s.indexOf(')')
  const input = s.substr(x1+1, x2-x1-1).split(',')
  // create a named function -- useful for debugging in console
  const type = nfn(name, input, function(...args) {
    // don't require new for constructing because that's lame
    if (!(this instanceof type)) {
      return new type(...args)
    }
    const props = fn(...args)
    type._fields = Object.keys(props)
    Object.assign(this, props)
    return this
  })
  defaultProto(type)
  return type
}

// create a simple type with a name, some properties, and
// optionally a parent type to inherit from.
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
  const type = nfn(name, fields, function(...args) {
    // don't require new for constructing because that's lame
    if (!(this instanceof type)) {
      return new type(...args)
    }
    // check you get the right number of args like it the wild west
    if (args.length !== fields.length) {
      throw new TypeError(`Expected ${fields.length} arguments, got ${args.length}`)
    }
    // assign args to fields
    for (let i = 0; i < fields.length; i++) {
      this[fields[i]] = args[i]
    }
    // this may be useful to have
    type._fields = fields
    return this
  })
  defaultProto(type)
  return type
}

// disjointed types / union types / sum types
//
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
  const type = nfn(name, [], function() {
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
    type[fname] = R.curryN(len, (...args) => {
      return args[len-1][fname](...args.slice(0, len-1))
    })
  }
  type.dispatch('equals', 2)
  return type
}

const withProto = (fn) => (...args) => {
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
  [is.string, is.hash, is.hash], withProto(taggedSum),
])

export default Type

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