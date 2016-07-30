const ResourcePool = require('../lib').ResourcePool
const chai = require('chai')
const expect = chai.expect

describe('ResourcePool', function() {
  describe('constructor', function() {
    it('Should throw error when initiated with negative pool size', function() {
      expect(function() {
        return new ResourcePool(-1, 1, function() {})
      }).to.throw(ResourcePool.INVALID_POOL_SIZE_VALUE_ERROR_MSG)
    })

    it('Should throw error when initiated with zero pool size', function() {
      expect(function() {
        return new ResourcePool(0, 1, function() {})
      }).to.throw(ResourcePool.INVALID_POOL_SIZE_VALUE_ERROR_MSG)
    })

    it('Should throw error when initiated with float pool size value', function() {
      expect(function() {
        return new ResourcePool(3.14, 1, function() {})
      }).to.throw(ResourcePool.INVALID_POOL_SIZE_TYPE_ERROR_MSG)
    })

    it('Should throw error when initiated with negative interval value', function() {
      expect(function() {
        return new ResourcePool(1, -1, function() {})
      }).to.throw(ResourcePool.INVALID_INTERVAL_VALUE_ERROR_MSG)
    })

    it('Should throw error when initiated with zero interval value', function() {
      expect(function() {
        return new ResourcePool(1, 0, function() {})
      }).to.throw(ResourcePool.INVALID_INTERVAL_VALUE_ERROR_MSG)
    })

    it('Should throw error when initiated with float interval value', function() {
      expect(function() {
        return new ResourcePool(1, 3.14, function() {})
      }).to.throw(ResourcePool.INVALID_INTERVAL_VALUE_ERROR_MSG)
    })

    it('Should throw error when initiated without callback function', function() {
      expect(function() {
        return new ResourcePool(1, 1)
      }).to.throw(ResourcePool.INVALID_CALLBACK_TYPE_ERROR_MSG)
    })
  })

  describe('#remaining', function() {
    let pool

    beforeEach(function() {
      pool = new ResourcePool(1, 100, function() {})
    })

    afterEach(function() {
      pool.destroy()
    })

    it('Should have full resource amount when initiated', function() {
      expect(pool.remaining).to.equal(1)
    })

    it('Should remaining be zero when exhausted', function() {
      pool.consume()
      expect(pool.remaining).to.equal(0)
    })
  })

  describe('#exhausted', function() {
    let pool

    beforeEach(function() {
      pool = new ResourcePool(1, 100, function() {})
    })

    afterEach(function() {
      pool.destroy()
    })

    it('Should be false when resources are available', function() {
      expect(pool.exhausted).to.false
    })

    it('Should be true when all resources are consumed', function() {
      pool.consume()
      expect(pool.exhausted).to.true
    })
  })

  describe('#consume()', function() {
    let pool

    beforeEach(function() {
      pool = new ResourcePool(1, 100, function() {})
    })

    afterEach(function() {
      pool.destroy()
    })

    it('Should return true when trying to consume resources from not empty pool', function() {
      expect(pool.consume()).to.true
    })

    it('Should return false when trying to consume resources from empty pool', function() {
      pool.consume()
      expect(pool.consume()).to.false
    })
  })

  describe('callback parameter', function() {
    it('Should be executed when out of resources', function(done) {
      const pool = new ResourcePool(1, 5, function() {
        done()
      })
      pool.consume()
    })

    it('Should be executed on time', function(done) {
      const startTime = Date.now()
      const pool = new ResourcePool(1, 5, function() {
        const timeDiff = Date.now() - startTime
        // added bonus time, because timers are not accurate
        expect(timeDiff).to.be.below(8)
        done()
      })
      pool.consume()
    })
  })

  describe('#destroy()', function() {
    // TODO: Find how to test if timeout is cleared
  })
})
