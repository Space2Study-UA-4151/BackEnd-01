const { createForbiddenError } = require('~/utils/errorsHelper')
const { tokenValidation } = require('~/utils/tokenValidation')

const authMiddleware = (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null)

  if (!accessToken) {
    return res.status(401).json({ message: 'Unauthorized: no token' })
  }

  try {
    const userData = tokenValidation(accessToken)
    req.user = userData
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized: invalid token' })
  }
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role
    if (!roles.includes(userRole)) {
      return next(createForbiddenError())
    }
    next()
  }
}

module.exports = { authMiddleware, restrictTo }
