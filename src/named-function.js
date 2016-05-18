'use strict'

const is = require('is-js')
const poly = require('./polymorphic')

// avoid errors and js injection incase you don't understand how this works
const purify = (name) =>
  name.replace(/[\{\}\(\) -\.]/g, '')

const NF = poly([
  // NF('add', (a,b) => a+b) // function Add() {...}
  [is.string, is.fn],
  (name, fn) =>
    new Function('fn',
      `return function ${purify(name)}(){return fn.apply(this,arguments)}`
    )(fn),
  // NF('add', ['a', 'b'], (a,b) => a+b) // function Add(a,b) {...}
  [is.string, is.array, is.fn],
  (name, args, fn) =>
    new Function('fn',
      `return function ${purify(name)}(${args.toString()}){return fn.apply(this,arguments)}`
    )(fn),
])

module.exports = NF
