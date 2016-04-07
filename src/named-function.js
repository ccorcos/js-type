import is from 'is-js'
import poly from './polymorphic'

const NF = poly([
  // NF('add', (a,b) => a+b) // function Add() {...}
  [is.string, is.fn],
    (name, fn) =>
      new Function('fn',
        `return function ${name}(){return fn.apply(this,arguments)}`
      )(fn),
  // NF('add', ['a', 'b'], (a,b) => a+b) // function Add(a,b) {...}
  [is.string, is.array, is.fn],
    (name, args, fn) =>
      new Function('fn',
        `return function ${name}(${args.toString()}){return fn.apply(this,arguments)}`
      )(fn),
])

export default NF
