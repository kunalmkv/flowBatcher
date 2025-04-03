const { expect } = require("chai")
const sinon = require("sinon")
const utils = require("../src/utils") // Adjust the path based on your project structure
const readline = require("readline")
const errorUtil = require("../src/utils/error.utils")
const validatorsUtil = require("../src/utils/validators.utils")

describe("Utils Functions", () => {
  // Test for throwError function
  describe("throwError", () => {
    it("should throw an error with the correct message and data", () => {
      const message = "This is an error!"
      const data = { errorCode: 400 }

      // Spy on the error throwing
      const throwErrorSpy = sinon.spy(errorUtil, "throwError")

      // Expect the error to be thrown
      expect(() => errorUtil.throwError(message, data)).to.throw(Error)
      expect(throwErrorSpy.calledOnce).to.be.true
      expect(throwErrorSpy.firstCall.args[0]).to.equal(message)
      expect(JSON.parse(throwErrorSpy.firstCall.args[1])).to.deep.equal(data)

      sinon.restore()
    })
  })

  // Test for getCurrentIndianTime function
  describe("getCurrentIndianTime", () => {
    it("should return the correct current Indian time", () => {
      const indianTime = utils.getCurrentIndianTime()

      // Check if the result is a valid date string
      expect(indianTime).to.be.a("string")
      expect(new Date(indianTime).toString()).to.not.equal("Invalid Date")
    })
  })

  // Test for setGlobalKey and getGlobalKey functions
  describe("setGlobalKey and getGlobalKey", () => {
    it("should set and get the global key correctly", () => {
      const key = "testKey"
      const value = "testValue"

      // Set the global key
      utils.setGlobalKey(key, value)

      // Get the global key
      const result = utils.getGlobalKey(key)

      // Assert the value was set and retrieved correctly
      expect(result).to.equal(value)
    })

    it("should throw an error if getGlobalKey is called with an empty key", () => {
      const invalidKey = ""

      // Expect an error to be thrown
      expect(() => utils.getGlobalKey(invalidKey)).to.throw(Error)
    })
  })

  // Test for promptUser function
  describe("promptUser", () => {
    it("should return the user input", async () => {
      const question = "What is your name?"
      const fakeAnswer = "John Doe"

      // Mock readline to simulate user input
      const rlStub = sinon.stub(readline, "createInterface").returns({
        question: (q, cb) => {
          cb(fakeAnswer) // Simulate the user input
        },
        close: sinon.stub(),
      })

      const answer = await utils.promptUser(question)

      // Assert that the answer matches the simulated user input
      expect(answer).to.equal(fakeAnswer)

      // Restore the original readline method
      rlStub.restore()
    })
  })

  // Test for isEmpty function
  describe("isEmpty", () => {
    it("should return true for empty values", () => {
      expect(utils.isEmpty(null)).to.be.true
      expect(utils.isEmpty(undefined)).to.be.true
      expect(utils.isEmpty("")).to.be.true
      expect(utils.isEmpty([])).to.be.true
      expect(utils.isEmpty({})).to.be.true
    })

    it("should return false for non-empty values", () => {
      expect(utils.isEmpty("non-empty")).to.be.false
      expect(utils.isEmpty([1])).to.be.false
      expect(utils.isEmpty({ key: "value" })).to.be.false
    })

    it("should return true for empty Set", () => {
      expect(utils.isEmpty(new Set())).to.be.true
    })

    it("should return false for non-empty Set", () => {
      const set = new Set()
      set.add(1)
      expect(utils.isEmpty(set)).to.be.false
    })
  })
})
