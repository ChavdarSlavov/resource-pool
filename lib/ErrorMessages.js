class ErrorMessages {
  static get INVALID_POOL_SIZE_VALUE() {
    return 'Invalid poolSize value. Must be positive.'
  }

  static get INVALID_POOL_SIZE_TYPE() {
    return 'Invalid poolSize value. Must be integer.'
  }

  static get INVALID_INTERVAL_VALUE() {
    return 'Invalid interval value. Must be positive.'
  }

  static get INVALID_CALLBACK_TYPE() {
    return 'Invalid callback value. Must be function.'
  }

  static get NO_RESOURCE_POOLS_FOUND() {
    return 'No resource pools found.'
  }
}

module.exports = ErrorMessages
