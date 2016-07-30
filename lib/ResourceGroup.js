const utils = require('./utils')
const ResourcePool = require('./ResourcePool')
const ErrorMessages = require('./ErrorMessages')

/**
 * Store pool size for all instances
 * @type {WeakMap}
 * @private
 * @ignore
 */
const pools = new WeakMap()

/**
 * Store callbacks for all instances
 * @type {WeakMap}
 * @private
 * @ignore
 */
const callbacks = new WeakMap()

/**
 * Helper function
 * @param  {ResourceGroup} group group reference
 * @return {Array}       list of the pools for that given reference
 * @private
 * @ignore
 */
function getPools(group) {
  return pools.get(group)
}

/**
 * Called when some of the pools have
 * its resources replenished
 * @private
 * @ignore
 */
function replenishCallback() {
  if (!this.exhausted) {
    const callback = callbacks.get(this)
    callback()
  }
}

/**
 * Class represents list of resource pools.
 * Its purpose is to make easy working with multiple
 * ResourcePools.
 */
class ResourceGroup {

  /**
   * Creates a resource pool group
   * @param  {Function} callback Called when at least one
   * of the pools las exhausted and than replenished.
   */
  constructor(callback) {
    if (!utils.isFunction(callback)) {
      throw new Error(ErrorMessages.INVALID_CALLBACK_TYPE)
    } else {
      callbacks.set(this, callback)
    }
    pools.set(this, [])
  }

  /**
   * Add new resource pool
   * @param  {number}   poolSize      Must be positive integer.
   * Represents the amount of resource replenished per cycle.
   * Also represents the maximum number of resources available at any point.
   * @param  {number}   interval      Must be positive integer.
   * Represents cycle's duration.

   */
  add(poolSize, interval) {
    if (!utils.isPositive(poolSize)) {
      throw new Error(ErrorMessages.INVALID_POOL_SIZE_VALUE)
    }
    if (!utils.isInt(poolSize)) {
      throw new Error(ErrorMessages.INVALID_POOL_SIZE_TYPE)
    }
    if (!utils.isPositive(interval)) {
      throw new Error(ErrorMessages.INVALID_INTERVAL_VALUE)
    }
    if (!utils.isInt(interval)) {
      throw new Error(ErrorMessages.INVALID_INTERVAL_VALUE)
    }

    const poolList = getPools(this)
    poolList.push(new ResourcePool(poolSize, interval, replenishCallback.bind(this)))
    pools.set(this, poolList)
    return this
  }

  /**
   * The count of resource in the pool with
   * the least amount of resources.
   * @return {number}
   */
  get remaining() {
    const poolList = getPools(this)
    if (!poolList.length) throw new Error(ErrorMessages.NO_RESOURCE_POOLS_FOUND)
    const poolRemainingList = poolList.map(pool => pool.remaining)
    return Math.min(...poolRemainingList)
  }

  /**
   * Is at least one of the pools exhausted.
   * @return {boolean}
   */
  get exhausted() {
    return this.remaining <= 0
  }

  /**
   * Consumes a single resource from each of the pulls.
   * @return {boolean}
   */
  consume() {
    if (this.exhausted) return false
    const poolList = getPools(this)
    poolList.forEach(pool => pool.consume())
    return true
  }

  /**
   * Stops all cycles and releases all
   * hard references.
   */
  destroy() {
    const poolList = getPools(this)
    poolList.forEach(pool => pool.destroy())
  }
}

module.exports = ResourceGroup
