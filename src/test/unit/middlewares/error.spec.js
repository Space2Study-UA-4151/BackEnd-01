const errorMiddleware = require('~/middlewares/error')

describe('errorMiddleware', () => {
  let res

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  it('should handle MongoServerError with code 11000 (duplicate)', () => {
    const err = {
      name: 'MongoServerError',
      code: 11000,
      message: 'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "test@gmail.com" }'
    }

    errorMiddleware(err, {}, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(409)
  })
  it('should handle ValidationError', () => {
    const err = {
      name: 'ValidationError',
      message: 'Some validation error'
    }
    errorMiddleware(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 409,
        code: expect.any(String),
        message: expect.stringContaining('Some validation error')
      })
    )
  })
  it('should handle unknown error', () => {
    const err = {
      message: 'Unknown error'
    }
    errorMiddleware(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        code: expect.any(String),
        message: 'Unknown error'
      })
    )
  })
  it('should handle error with custom status and code', () => {
    const err = {
      status: 418,
      code: 'I_AM_A_BEGINNER',
      message: 'I am a beginner!'
    }
    errorMiddleware(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(418)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 418,
        code: 'I_AM_A_BEGINNER',
        message: 'I am a beginner!'
      })
    )
  })
  it('should handle MongoServerError with unknown code', () => {
    const err = {
      name: 'MongoServerError',
      code: 99999,
      message: 'Some mongo error'
    }
    errorMiddleware(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        code: expect.any(String),
        message: 'Some mongo error'
      })
    )
  })
})
