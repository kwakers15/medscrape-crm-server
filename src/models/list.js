const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  kols: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      required: true,
      trim: true
    }
  }],
}, {
  timestamps: true
})
mongoose.Schema.Types.String.checkRequired(v => v != null)
const List = mongoose.model('List', listSchema)

module.exports = List