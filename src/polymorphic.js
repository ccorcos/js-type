// polymorphic functions are functions that accept different
// types of arguments.
//
// poly([[isValidArg],
//         function(a){},
//       [another, valid, arg],
//         fuction(a,b,c){}])
//
const poly = list => (...args) => {
  for (let i = 0; i < list.length; i += 2) {
    if (args.length === list[i].length) {
      let eq = true
      for (let j = 0; j < args.length; j++) {
        eq = eq && list[i][j](args[j])
      }
      if (eq) {
        return list[i+1](...args)
      }
    }
  }
  throw new Error('Unknown arguments for polymorphic function.')
}

export default poly
