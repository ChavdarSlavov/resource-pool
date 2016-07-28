module.exports.isPositive = function isPositive(num) {
  return num > 0
}

module.exports.isInt = function isInt(num) {
  return num === parseInt(num, 10)
}

module.exports.isFunction = function isFunction(fn) {
  return typeof fn === 'function'
}
