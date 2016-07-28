const utils = require('./utils')
/**
 * Store resource limit
 * @type {WeakMap}
 * @private
 */
const poolSizes = new WeakMap()
const intervals = new WeakMap()
const callbacks = new WeakMap()
const cycles = new WeakMap()

/**
 * Store the current resource amount
 * @type {WeakMap}
 * @private
 */
const currentPoolSize = new WeakMap()

/**
 * Start a cycle after which resources for a
 * given pool instance will be replenished.
 * @param  {ResourcePool} pool pool reference
 * @return {number}      timeout id
 * @private
 */
function startCycle(pool) {
  return setTimeout(() => {
    cycles.delete(pool)
    const poolLasExausted = pool.exausted
    pool.replenish()
    if (poolLasExausted) {
      const callback = callbacks.get(this)
      callback()
    }
  }, intervals.get(pool))
}

/**
 * Class represents self replenishing pool of
 * resources that can be harvested up to an exhaustion point.
 * Resources will auto replenish according to the specified
 * parameters upon creation. When created the pool will
 * contain the maximum amount of resource that it can
 * possibly have.
 */
class ResourcePool {
  /**
   * Create a resource pool
   * @param  {number}   poolSize      Must be positive integer.
   * Represents the amount of resource replenished per cycle.
   * Also represents the maximum number of resources available at any point.
   * @param  {number}   interval      Must be positive integer.
   * Represents cycle's duration.
   * @param  {Function} callback      If all resources were exhausted
   * last cycle callback will be triggered when new resources are available
   * (the start of this cycle).
   */
  constructor(poolSize, interval, callback) {
    if (!utils.isPositive(poolSize)) {
      throw new Error('Invalid poolSize value. Must be positive.')
    } else if (!utils.isInt(poolSize)) {
      throw new Error('Invalid poolSize value. Must be integer.')
    } else {
      poolSizes.set(this, poolSize)
    }

    if (!utils.isPositive(interval)) {
      throw new Error('Invalid interval value. Must be positive.')
    } else if (!utils.isInt(interval)) {
      throw new Error('Invalid interval value. Must be integer.')
    } else {
      intervals.set(this, interval)
    }

    if (!utils.isFunction(callback)) {
      throw new Error('Invalid callback value. Must be function.')
    } else {
      callbacks.set(this, callback)
    }
  }

  /**
   * Replenish all resources after a full cycle.
   */
  replenish() {
    const resourceAmount = poolSizes.get(this)
    currentPoolSize.set(this, resourceAmount)
  }

  /**
   * Remaining resources count.
   * @return {number}
   */
  get remaining() {
    return currentPoolSize.get(this)
  }

  /**
   * Is the pool exhausted
   * @return {boolean}
   */
  get exausted() {
    return this.remaining <= 0
  }

  /**
   * Consumes a single resource.
   * @return {boolean}
   */
  consume() {
    if (this.exausted) return false
    currentPoolSize.set(this, this.remaining - 1)

    if (!cycles.has(this)) {
      const cycleId = startCycle(this)
      cycles.set(this, cycleId)
    }
    return true
  }
}

module.exports = ResourcePool
