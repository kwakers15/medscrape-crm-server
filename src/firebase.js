const { initializeApp, applicationDefault } = require('firebase-admin/app')

const app = initializeApp({
  credential: applicationDefault()
})

module.exports = app