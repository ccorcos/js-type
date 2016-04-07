require('type')

if (module.hot) {
  // accept update of dependency
  module.hot.accept('type', () => {
    equire('./type')
  })
}
