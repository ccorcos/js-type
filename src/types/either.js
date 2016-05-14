const Type = require('../type')

const Either = Type('Either', {
  Right: ['value'],
  Left: ['value']
}, {
  map: {
    Right: (f, x) => Either.Right(f(x.value)),
    Left: (f, x) => x
  },
  ap: {
    Right: (m, mfn) => m instanceof Either.Right ? Either.Right(mfn.value(m.value)) : m,
    Left: (m, mfn) => mfn
  },
  concat: {
    Right: (a, b) => a instanceof Either.Right ? Either.Right(b.value.concat(a.value)) : a,
    Left: (a, b) => b
  },
  sequence: {
    Right: (m_of, x) => Either.Right(m_of(x.value)),
    Left: (m_of, x) => x
  },
  chain: {
    Right: (fn, x) => fn(x.value),
    Left: (fn, x) => x
  }
})

module.exports = Either
