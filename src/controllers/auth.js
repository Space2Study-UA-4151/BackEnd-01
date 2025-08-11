const authService = require('~/services/auth')

const { oneDayInMs } = require('~/consts/auth')
// const {
//   config: { COOKIE_DOMAIN }
// } = require('~/configs/config')
const {
  tokenNames: { REFRESH_TOKEN, ACCESS_TOKEN }
} = require('~/consts/auth')

const COOKIE_OPTIONS = {
  maxAge: oneDayInMs,
  httpOnly: true,
  secure: true,
  sameSite: 'none'
  // domain: COOKIE_DOMAIN
}

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body
  const lang = req.lang

  const userData = await authService.signup(role, firstName, lastName, email, password, lang)

  res.status(201).json({ status: 201, message: 'User registered successfully!', userData })
}

const login = async (req, res) => {
  const { email, password } = req.body

  const session = await authService.login(email, password)

  res.cookie(ACCESS_TOKEN, session.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, session.refreshToken, COOKIE_OPTIONS)

  res.json({
    status: 200,
    message: 'Login completed',
    accessToken: session.accessToken
  })

  // delete tokens.refreshToken

  // res.status(200).json(tokens)
}

const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', COOKIE_OPTIONS)
    res.clearCookie('accessToken', COOKIE_OPTIONS)

    const { refreshToken } = req.cookies
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token not provided' })
    }
    const deleted = await authService.logout(refreshToken)

    if (!deleted) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    return res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ message: 'Logout failed' })
  }
}

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    res.clearCookie(ACCESS_TOKEN)

    return res.status(401).end()
  }

  const tokens = await authService.refreshAccessToken(refreshToken)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body
  const lang = req.lang

  await authService.sendResetPasswordEmail(email, lang)

  res.status(204).end()
}

const updatePassword = async (req, res) => {
  const { password } = req.body
  const resetToken = req.params.token
  const lang = req.lang

  await authService.updatePassword(resetToken, password, lang)

  res.status(204).end()
}

module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  sendResetPasswordEmail,
  updatePassword
}
