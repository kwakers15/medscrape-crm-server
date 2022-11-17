const express = require('express')
require('./db/mongoose')
const List = require('./models/list')
const User = require('./models/user')
const auth = require('./middleware/auth')

const app = express()
const port = process.env.PORT | 3001

app.use(express.json())

// USE ROUTER TO SEPARATE LIST AND USER ENDPOINTS

// POST a new user to the database
app.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    res.status(201).send(user)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// DELETE me
app.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  }
  catch (e) {
    res.status(500).send(e)
  }
})

// POST a new list
app.post('/list', auth, async (req, res) => {
  const list = new List({
    ...req.body,
    owner: req.user._id
  })

  try {
    await list.save()
    res.status(201).send(list)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// DELETE a list by its listid
app.delete('/list/:listId', auth, async (req, res) => {
  const _id = req.params.listId

  try {
    const list = await List.findOneAndDelete({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ error: 'No list found for user ' + userID + ' and listId ' + _id })
      return
    }
    res.send(list)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// GET a list by its listid
app.get('/list/:listId', auth, async (req, res) => {
  const _id = req.params.listId

  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ error: 'No list found for user' })
      return
    }
    res.send(list)
  }
  catch (e) {
    if (e.name === 'CastError') {
      res.status(400).send('Invalid list ID')
    }
    res.status(500).send()
  }
})

// POST a new kol to a list
app.post('/list/:listId/kol', auth, async (req, res) => {
  const kol = req.body
  const _id = req.params.listId

  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ error: 'No list found for user' })
      return
    }
    list.kols.push(kol)
    await list.save()
    res.status(201).send(list)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// DELETE a kol by its listid and npi
app.delete('/list/:listId/kol/:npi', auth, async (req, res) => {
  const _id = req.params.listId
  const npi = req.params.npi

  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ error: 'No list found for user ' + userID + ' and listId ' + _id })
      return
    }
    const indexOfKol = list.kols.findIndex(kol => kol.npi == npi)
    if (indexOfKol === -1) {
      res.status(404).send({ error: 'The specified kol was not found in the list' })
      return
    }
    list.kols.splice(indexOfKol, 1)
    await list.save()
    res.send(list)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// GET all lists
app.get('/lists', auth, async (req, res) => {
  // /tasks?completed=True
  // /tasks?limit=10&skip=10
  // /tasks?sortBy=createdAt:desc
  // router.get('/tasks', auth, async (req, res) => {
  //   const match = {}
  //   const sort = {}
  //   if (req.query.completed) {
  //       match.completed = req.query.completed === 'true'
  //   }
  //   if (req.query.sortBy) {
  //       const parts = req.query.sortBy.split(':')
  //       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  //   }
  //   try {
  //       await req.user.populate({
  //           path: 'tasks',
  //           match,
  //           options: {
  //               limit: parseInt(req.query.limit),
  //               skip: parseInt(req.query.skip),
  //               sort
  //           }
  //       }).execPopulate()
  //       res.send(req.user.tasks)
  //   }
  //   catch (e) {
  //      res.status(500).send()
  //   }
  const lists = await List.find({ owner: req.user._id })
  if (lists.length) {
    res.send(lists)
  } else {
    res.status(400).send({ error: "No lists for user" })
  }
})

// GET all kols in a list by listid
app.get('/list/:listId/kol', auth, async (req, res) => {
  const _id = req.params.listId

  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ error: 'No list found for user' })
    }
    res.status(200).send(list.kols)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// GET a kol by its id
app.get('/list/:listId/kol/:npi', auth, async (req, res) => {
  const _id = req.params.listId
  const npi = req.params.npi

  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ 'error': 'No list found for user' })
    }
    const indexOfKol = list.kols.findIndex(kol => kol.npi == npi)
    if (indexOfKol === -1) {
      res.status(404).send({ error: 'The specified kol was not found in the list' })
      return
    }
    res.status(200).send(list.kols[indexOfKol])
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// DELETE all lists
app.delete('/lists', auth, async (req, res) => {
  try {
    const listsToDelete = await List.find({ owner: req.user._id })
    await List.deleteMany({ owner: req.user._id })
    res.status(200).send(listsToDelete)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// PATCH a specific kol
app.patch('/list/:listId/kol/:npi', auth, async (req, res) => {
  const _id = req.params.listId
  const npi = req.params.npi

  const allowedUpdates = ['name', 'notes']
  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' })
  }
  try {
    const list = await List.findOne({ _id, owner: req.user._id })
    if (!list) {
      res.status(404).send({ 'error': 'No list found for user' })
      return
    }
    const indexOfKol = list.kols.findIndex(kol => kol.npi == npi)
    if (indexOfKol === -1) {
      res.status(404).send({ error: 'The specified kol was not found in the list' })
      return
    }
    const kol = list.kols[indexOfKol]
    updates.forEach(update => kol[update] = req.body[update])
    await list.save()
    res.send(list)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

app.listen(port, () => {
  console.log('Server is up on port ' + port)
})