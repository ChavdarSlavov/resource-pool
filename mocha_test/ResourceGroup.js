const ResourceGroup = require('../lib').ResourceGroup
const ErrorMessages = require('../lib/ErrorMessages')
const chai = require('chai')
const expect = chai.expect

describe('ResourcePool', function() {
  describe('constructor', function() {
    it('Should pass when called with valid parameter', function(done) {
      const poolGroup = new ResourceGroup(function() {})
      done()
      return poolGroup
    })
    it('Should throw error when initiated without callback function', function() {
      expect(function() {
        return new ResourceGroup()
      }).to.throw(ErrorMessages.INVALID_CALLBACK_TYPE)
    })
  })

  describe('#add', function() {
    let poolGroup

    beforeEach(function() {
      poolGroup = new ResourceGroup(function() {})
    })

    afterEach(function() {
      poolGroup.destroy()
    })

    it('Should throw error when initiated with negative pool size', function() {
      expect(function() {
        poolGroup.add(-1, 1, function() {})
      }).to.throw(ErrorMessages.INVALID_POOL_SIZE_VALUE)
    })

    it('Should throw error when initiated with zero pool size', function() {
      expect(function() {
        poolGroup.add(0, 1, function() {})
      }).to.throw(ErrorMessages.INVALID_POOL_SIZE_VALUE)
    })

    it('Should throw error when initiated with float pool size value', function() {
      expect(function() {
        poolGroup.add(3.14, 1, function() {})
      }).to.throw(ErrorMessages.INVALID_POOL_SIZE_TYPE)
    })

    it('Should throw error when initiated with negative interval value', function() {
      expect(function() {
        poolGroup.add(1, -1, function() {})
      }).to.throw(ErrorMessages.INVALID_INTERVAL_VALUE)
    })

    it('Should throw error when initiated with zero interval value', function() {
      expect(function() {
        poolGroup.add(1, 0, function() {})
      }).to.throw(ErrorMessages.INVALID_INTERVAL_VALUE)
    })

    it('Should throw error when initiated with float interval value', function() {
      expect(function() {
        poolGroup.add(1, 3.14, function() {})
      }).to.throw(ErrorMessages.INVALID_INTERVAL_VALUE)
    })
  })

  describe('#remaining', function() {
    let poolGroup

    beforeEach(function() {
      poolGroup = new ResourceGroup(function() {})
    })

    afterEach(function() {
      poolGroup.destroy()
    })

    it('Should throw error when called with no pools', function() {
      expect(function() {
        return poolGroup.remaining
      }).to.throw(ErrorMessages.NO_RESOURCE_POOLS_FOUND)
    })

    describe('single pool', function() {
      it('Should return full resource count when initiated', function() {
        poolGroup.add(1, 10)
        expect(poolGroup.remaining).to.equal(1)
      })

      it('Should return zero when there are no resources available', function() {
        poolGroup.add(1, 10)
        poolGroup.consume()
        expect(poolGroup.remaining).to.equal(0)
      })
    })

    describe('multiple pools', function() {
      it('Should return the size of pool with lowest remaining resources', function() {
        poolGroup.add(2, 10)
                 .add(5, 10)
        expect(poolGroup.remaining).to.equal(2)
      })

      it('Should return zero when there are no resources available', function() {
        poolGroup.add(2, 10)
        poolGroup.add(5, 10)
        poolGroup.consume()
        poolGroup.consume()
        expect(poolGroup.remaining).to.equal(0)
      })
    })
  })

  describe('#exhausted', function() {
    let poolGroup

    beforeEach(function() {
      poolGroup = new ResourceGroup(function() {})
    })

    afterEach(function() {
      poolGroup.destroy()
    })

    describe('single pool', function() {
      it('Should be false when resources are available ', function() {
        poolGroup.add(1, 10)
        expect(poolGroup.exhausted).to.false
      })

      it('Should be true when all resources are consumed ', function() {
        poolGroup.add(1, 10)
        poolGroup.consume()
        expect(poolGroup.exhausted).to.true
      })
    })

    describe('multiple pools', function() {
      it('Should be false when resources are available ', function() {
        poolGroup.add(2, 10)
        poolGroup.add(5, 10)
        expect(poolGroup.exhausted).to.false
      })

      it('Should be true when all resources are consumed ', function() {
        poolGroup.add(2, 10)
        poolGroup.add(5, 10)
        poolGroup.consume()
        poolGroup.consume()
        expect(poolGroup.exhausted).to.true
      })
    })
  })

  describe('#consume()', function() {
    let poolGroup

    beforeEach(function() {
      poolGroup = new ResourceGroup(function() {})
    })

    afterEach(function() {
      poolGroup.destroy()
    })

    describe('single pool', function() {
      it('Should return true when pool is not empty', function() {
        poolGroup.add(1, 10)
        expect(poolGroup.consume()).to.true
      })

      it('Should return false when poop is empty', function() {
        poolGroup.add(1, 10)
        poolGroup.consume()
        expect(poolGroup.consume()).to.false
      })
    })

    describe('multiple pools', function() {
      it('Should return true when pools are not empty', function() {
        poolGroup.add(2, 10)
        poolGroup.add(5, 10)
        expect(poolGroup.consume()).to.true
      })

      it('Should return false when at least one poop is empty', function() {
        poolGroup.add(2, 10)
        poolGroup.add(5, 10)
        poolGroup.consume()
        poolGroup.consume()
        expect(poolGroup.consume()).to.false
      })
    })
  })

  describe('callback parameter', function() {
    describe('single pool', function() {
      it('Should be executed when out of resources', function(done) {
        const poolGroup = new ResourceGroup(function() {
          done()
        })
        poolGroup.add(1, 1)
        poolGroup.consume()
      })

      it('Should be executed on time', function(done) {
        const startTime = Date.now()
        const poolGroup = new ResourceGroup(function() {
          const timeDiff = Date.now() - startTime
          // added bonus time, because timers are not accurate
          expect(timeDiff).to.be.below(10)
          done()
        })
        poolGroup.add(1, 5)
        poolGroup.consume()
      })
    })

    describe('multiple pools', function() {
      it('Should be executed when out of resources', function(done) {
        const poolGroup = new ResourceGroup(function() {
          done()
        })
        poolGroup.add(2, 1)
        poolGroup.add(5, 1)
        poolGroup.consume()
        poolGroup.consume()
      })

      it('Should be executed on time', function(done) {
        const startTime = Date.now()
        const poolGroup = new ResourceGroup(function() {
          const timeDiff = Date.now() - startTime
          // added bonus time, because timers are not accurate
          expect(timeDiff).to.be.below(10)
          done()
        })
        poolGroup.add(2, 5)
        poolGroup.add(5, 5)
        poolGroup.consume()
        poolGroup.consume()
      })
    })
  })

  describe('#destroy()', function() {
    describe('single pool', function() {
      it('Should not execute callback', function(done) {
        const poolGroup = new ResourceGroup(function() {
          done(new Error('Callback should not be executed'))
        })
        poolGroup.add(1, 5)
        poolGroup.consume()
        poolGroup.destroy()
        setTimeout(() => {
          done()
        }, 10)
      })
    })

    describe('multiple pools', function() {
      it('Should not execute callback', function(done) {
        const poolGroup = new ResourceGroup(function() {
          done(new Error('Callback should not be executed'))
        })
        poolGroup.add(2, 5)
        poolGroup.add(5, 5)
        poolGroup.consume()
        poolGroup.consume()
        poolGroup.destroy()
        setTimeout(() => {
          done()
        }, 10)
      })
    })
  })
})
