import Type from '../type'

const Maybe = Type('Maybe', {
  Just: ['value'],
  Nothing: [],
}, {
  map: {
    Just: (f, x) => Maybe.Just(f(x.value)),
    Nothing: (f, x) => x,
  },
  ap: {
    Just: (m, mfn) => m instanceof Maybe.Just ? Maybe.Just(mfn.value(m.value)) : m,
    Nothing: (m, mfm) => mfn,
  },
  concat: {
    Just: (a, b) => a instanceof Maybe.Just ? Maybe.Just(b.value.concat(a.value)) : a,
    Nothing: (a, b) => b,
  },
  sequence: {
    Just: (m_of, x) => Maybe.Just(m_of(x.value)),
    Nothing: (m_of, x) => x,
  },
  chain: {
    Just: (fn, x) => fn(x.value),
    Nothing: (fn, x) => x,
  },
})