const ResourcePool = require('./ResourcePool')

const pools = new WeakMap()

class ResourceGroup {
  constructor() {
    pools.set(this, [])
  }

  add(pool) {

  }

  get exhausted() {

  }

  consume() {

  }

  destroy() {

  }
}

module.exports = ResourceGroup