const express = require('express')
require('./db/mongoose')
const List = require('./models/list')

const app = express()
const port = process.env.PORT | 3001

app.use(express.json())

// POST a new list
app.post('/:userId/list', async (req, res) => {
  const list = new List({
    userID: req.params.userId,
    ...req.body,
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
app.delete('/:userId/list/:listId', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId

  try {
    const list = await List.findOneAndDelete({ _id, userID })
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
app.get('/:userId/list/:listId', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId

  try {
    const list = await List.findOne({ _id, userID })
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

// POST a new kol to a list
app.post('/:userId/list/:listId/kol', async (req, res) => {
  const kol = req.body
  const _id = req.params.listId
  const userID = req.params.userId

  try {
    const list = await List.findOne({ _id, userID })
    if (!list) {
      res.status(404).send({ error: 'No list found for user ' + userID + ' and listId ' + _id })
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

// DELETE a kol by its listid and kolid
app.delete('/:userId/list/:listId/kol/:npi', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId
  const npi = req.params.npi

  try {
    const list = await List.findOne({ _id, userID })
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
app.get('/:userId/lists', async (req, res) => {
  const lists = await List.find({ userID: req.params.userId })
  if (lists.length) {
    res.send(lists)
  } else {
    res.status(400).send({ error: "No lists for user " + req.params.userId })
  }
})

// GET all kols in a list by listid
app.get('/:userId/list/:listId/kol', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId

  try {
    const list = await List.findOne({ _id, userID })
    if (!list) {
      res.status(404).send({ error: 'No list found for user ' + userID + ' and listId ' + _id })
    }
    res.status(200).send(list.kols)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// GET a kol by its id
app.get('/:userId/list/:listId/kol/:npi', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId
  const npi = req.params.npi

  try {
    const list = await List.findOne({ _id, userID })
    if (!list) {
      res.status(404).send({ 'error': 'No list found for user ' + userID + ' and listId ' + _id })
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
app.delete('/:userId/lists', async (req, res) => {
  const userID = req.params.userId

  try {
    const listsToDelete = await List.find({ userID })
    await List.deleteMany({ userID })
    res.status(200).send(listsToDelete)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// PATCH a specific kol
app.patch('/:userId/list/:listId/kol/:npi', async (req, res) => {
  const _id = req.params.listId
  const userID = req.params.userId
  const npi = req.params.npi

  const allowedUpdates = ['name', 'notes']
  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' })
  }
  try {
    const list = await List.findOne({ _id, userID })
    if (!list) {
      res.status(404).send({ 'error': 'No list found for user ' + userID + ' and listId ' + _id })
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