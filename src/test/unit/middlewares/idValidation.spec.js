const idValidation = require('~/middlewares/idValidation')
const mongoose = require('mongoose')

jest.mock('~/utils/errorsHelper', () => ({
  createError: jest.fn((status, message) => ({ status, message }))
}))
jest.mock('~/consts/errors', () => ({
  INVALID_ID: 'Invalid ID'
}))

describe('idValidation middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
  })

  it('should call next() if id is valid', () => {
    const validId = new mongoose.Types.ObjectId().toHexString()
    expect(() => idValidation(req, res, next, validId)).not.toThrow()
    expect(next).toHaveBeenCalled()
  })

  it('should throw error if id is invalid', () => {
    const invalidId = 'invalid_id'
    expect(() => idValidation(req, res, next, invalidId)).toThrowError(
      expect.objectContaining({
        status: 400,
        message: 'Invalid ID'
      })
    )
    expect(next).not.toHaveBeenCalled()
  })
})
