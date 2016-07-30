const utils = require('./utils')
const ErrorMessages = require('./ErrorMessages')

/**
 * Store pool size for all instances
 * @type {WeakMap}
 * @private
 * @ignore
 */
const poolSizes = new WeakMap()

/**
 * Store cycle duration in milliseconds
 * @type {WeakMap}
 * @private
 * @ignore
 */
const intervals = new WeakMap()

/**
 * Store callbacks for all instances
 * @type {WeakMap}
 * @private
 * @ignore
 */
const callbacks = new WeakMap()

/**
 * Store timeout id for all instances
 * @type {WeakMap}
 * @private
 * @ignore
 */
const cycles = new WeakMap()

/**
 * Store the current resource amount
 * @type {WeakMap}
 * @private
 * @ignore
 */
const currentPoolSize = new WeakMap()

/**
 * Replenish all resources after a full cycle.
 * @param  {ResourcePool} pool pool reference
 * @private
 * @ignore
 */
function replenish(pool) {
  const resourceAmount = poolSizes.get(pool)
  currentPoolSize.set(pool, resourceAmount)
}

/**
 * Start a cycle after which resources for a
 * given pool instance will be replenished.
 * @param  {ResourcePool} pool pool reference
 * @return {number}      timeout id
 * @private
 * @ignore
 */
function startCycle(pool) {
  return setTimeout(() => {
    cycles.delete(pool)
    const poolLasExhausted = pool.exhausted
    replenish(pool)
    if (poolLasExhausted) {
      const callback = callbacks.get(pool)
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
      throw new Error(ErrorMessages.INVALID_POOL_SIZE_VALUE)
    } else if (!utils.isInt(poolSize)) {
      throw new Error(ErrorMessages.INVALID_POOL_SIZE_TYPE)
    } else {
      poolSizes.set(this, poolSize)
    }

    if (!utils.isPositive(interval)) {
      throw new Error(ErrorMessages.INVALID_INTERVAL_VALUE)
    } else if (!utils.isInt(interval)) {
      throw new Error(ErrorMessages.INVALID_INTERVAL_VALUE)
    } else {
      intervals.set(this, interval)
    }

    if (!utils.isFunction(callback)) {
      throw new Error(ErrorMessages.INVALID_CALLBACK_TYPE)
    } else {
      callbacks.set(this, callback)
    }

    replenish(this)
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
  get exhausted() {
    return this.remaining <= 0
  }

  /**
   * Consumes a single resource.
   * @return {boolean}
   */
  consume() {
    if (this.exhausted) return false
    currentPoolSize.set(this, this.remaining - 1)

    if (!cycles.has(this)) {
      const cycleId = startCycle(this)
      cycles.set(this, cycleId)
    }
    return true
  }

  /**
   * Stops all cycles and releases all
   * hard references.
   */
  destroy() {
    if (cycles.has(this)) {
      clearTimeout(cycles.get(this))
    }
  }
}

module.exports = ResourcePool
