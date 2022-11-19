const firebase = require('../firebase')
const { getAuth } = require('firebase-admin/auth')
const User = require('../models/user')


const auth = async (req, res, next) => {
  try {
    const decodedToken = await getAuth(firebase).verifyIdToken(req.header('Authorization').replace('Bearer ', ''))
    const uid = decodedToken.uid
    req.user = await User.findOne({ uid })
    next()
  }
  catch (e) {
    console.log(e)
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = auth