const bcrypt = require('bcrypt')

const { v4: uuidv4 } = require('uuid')
const tokenService = require('~/services/token')
const emailService = require('~/services/email')
const UserModel = require('~/models/user')
const { getUserByEmail, privateUpdateUser, getUserById } = require('~/services/user')
const { createError, createUnauthorizedError } = require('~/utils/errorsHelper')
const {
  //   EMAIL_NOT_CONFIRMED,
  //   INCORRECT_CREDENTIALS,
  BAD_RESET_TOKEN,
  BAD_REFRESH_TOKEN,
  USER_NOT_FOUND
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const {
  tokenNames: { REFRESH_TOKEN, RESET_TOKEN, CONFIRM_TOKEN }
} = require('~/consts/auth')

const authService = {
  signup: async (role, firstName, lastName, email, password, language) => {
    const userEmail = await UserModel.findOne({ email })
    if (userEmail) {
      throw createError(409, 'Email in use')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const activationLink = uuidv4()
    const user = UserModel.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      language,
      activationLink
    })

    const confirmToken = tokenService.generateConfirmToken({ id: user._id, role })
    await tokenService.saveToken(user._id, confirmToken, CONFIRM_TOKEN)
    // await emailService.sendEmail(email, emailSubject.EMAIL_CONFIRMATION, language, { confirmToken, email, firstName })
    return {
      userId: user._id,
      userEmail: user.email
    }
  },

  login: async (email, password) => {
    // const user = await getUserByEmail(email)
    const user = await UserModel.findOne({ email }).select('+password +isFirstLogin +firstName +lastName')
    if (!user) {
      throw createUnauthorizedError()
    }
    console.log('Compare:', password, user && user.password)

    const areEqualPassword = await bcrypt.compare(password, user.password)
    if (!areEqualPassword) {
      throw createUnauthorizedError()

    }
    const payload = {
      id: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isFirstLogin: user.isFirstLogin

    }
    const { accessToken, refreshToken } = tokenService.generateTokens(payload)
    await tokenService.saveToken(payload.id, refreshToken, REFRESH_TOKEN)
    console.log('user.role:', user.role, Array.isArray(user.role))

    return {
      accessToken,
      refreshToken,
      id: user._id
    }

    // const checkedPassword = password === user.password || isFromGoogle

    // if (!checkedPassword) {
    //   throw createError(401, INCORRECT_CREDENTIALS)
    // }

    // const { _id, lastLoginAs, isFirstLogin, isEmailConfirmed } = user

    // if (!isEmailConfirmed) {
    //   throw createError(401, EMAIL_NOT_CONFIRMED)
    // }

    // const tokens = tokenService.generateTokens({ id: _id, role: lastLoginAs, isFirstLogin })
    // await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    // if (isFirstLogin) {
    //   await privateUpdateUser(_id, { isFirstLogin: false })
    // }

    // await privateUpdateUser(_id, { lastLogin: new Date() })
  },

  logout: async (refreshToken) => {
    await tokenService.removeRefreshToken(refreshToken)
  },

  refreshAccessToken: async (refreshToken) => {
    const tokenData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = await tokenService.findToken(refreshToken, REFRESH_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_REFRESH_TOKEN)
    }

    const { _id, lastLoginAs, isFirstLogin } = await getUserById(tokenData.id)

    const tokens = tokenService.generateTokens({ id: _id, role: lastLoginAs, isFirstLogin })
    await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    return tokens
  },

  sendResetPasswordEmail: async (email, language) => {
    const user = await getUserByEmail(email)

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    const { _id, firstName } = user

    const resetToken = tokenService.generateResetToken({ id: _id, firstName, email })
    await tokenService.saveToken(_id, resetToken, RESET_TOKEN)

    await emailService.sendEmail(email, emailSubject.RESET_PASSWORD, language, { resetToken, email, firstName })
  },

  updatePassword: async (resetToken, password, language) => {
    const tokenData = tokenService.validateResetToken(resetToken)
    const tokenFromDB = await tokenService.findToken(resetToken, RESET_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_RESET_TOKEN)
    }

    const { id: userId, firstName, email } = tokenData
    await privateUpdateUser(userId, { password })

    await tokenService.removeResetToken(userId)

    await emailService.sendEmail(email, emailSubject.SUCCESSFUL_PASSWORD_RESET, language, {
      firstName
    })
  }
}

module.exports = authService
