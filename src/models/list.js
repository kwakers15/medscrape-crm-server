const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  kols: [{
    npi: {
      type: String,
      required: true
    },
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})
mongoose.Schema.Types.String.checkRequired(v => v != null)
const List = mongoose.model('List', listSchema)

module.exports = List