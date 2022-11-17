const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  uid: {
    type: String,
    unique: true,
    required: true,
  }
}, {
  timestamps: true
})

userSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'owner'
})

// Delete user lists when user is removed
userSchema.pre('remove', async function (next) {
  const user = this
  await List.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User