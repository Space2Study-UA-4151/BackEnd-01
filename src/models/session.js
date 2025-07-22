const { Schema, model } = require('mongoose')

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    accessTokenValidUntil: {
      type: Date,
      required: true
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true
    },
    userAgent: String,
    ip: String
  },
  {
    versionKey: false
  }
)

module.exports = model('Session', sessionSchema)
