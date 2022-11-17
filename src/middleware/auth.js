const firebase = require('../firebase')
const { getAuth } = require('firebase-admin/auth')
const User = require('../models/user')


const auth = async (req, res, next) => {
  const decodedToken = await getAuth(firebase).verifyIdToken(req.header('Authorization').replace('Bearer ', ''))
  const uid = decodedToken.uid
  req.user = await User.findOne({ uid })
  next()

}

module.exports = auth