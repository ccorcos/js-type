// can't do it without a custom constructor to wrap the Failure value in an Array

const Validation = Type('Validation', {
  Success: (x) => {x}
  Failure: (x) => {x:[x]}
}, {
  // map: {
  //   Success: (f, x) => Validation.Success(f(x.value)),
  //   Failure: (f, x) => x,
  // },
  // ap: {
  //   Success: (m, mfn) => m instanceof Validation.Success ? Validation.Success(mfn.value(m.value)) : m,
  //   Failure: (m, mfm) => mfn,
  // },
  // concat: {
  //   Success: (a, b) => a instanceof Validation.Success ? Validation.Success(b.value.concat(a.value)) : a,
  //   Failure: (a, b) => b,
  // },
  // sequence: {
  //   Success: (m_of, x) => Validation.Failure(m_of(x.value)),
  //   Failure: (m_of, x) => Validation.Success(m_of(x.value)),
  // },
  // chain: {
  //   Success: (fn, x) => fn(x.value),
  //   Failure: (fn, x) => x,
  // },
})