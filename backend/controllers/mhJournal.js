const mhJournalRouter = require('express').Router()
const logger = require('../utils/logger')
const MhJournal = require('../models/mhJournal')

mhJournalRouter.get('/', async (req, res) => {
  const mhJournal = await MhJournal.find({})
  if (mhJournal) {
    res.json(mhJournal)
  } else {
    res.status(404).end()
  }
})

mhJournalRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const mhJournal = await MhJournal.findById(id)
  if (mhJournal) {
    res.json(mhJournal)
  } else {
    res.status(404).end()
  }
})

mhJournalRouter.post('/', async (req, res) => {
  const { intimateRelationships, friendships, familyRelationships, career, health, physicalWellbeing, mentalWellbeing, drugAndAlcoholUse, productivityOutsideOfCareer, Date, spirituality } = req.body

  if (req.body === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  const mhJournal = new MhJournal({
    intimateRelationships: intimateRelationships,
    friendships: friendships,
    familyRelationships: familyRelationships,
    career: career,
    health: health,
    physicalWellbeing: physicalWellbeing,
    mentalWellbeing: mentalWellbeing,
    drugAndAlcoholUse: drugAndAlcoholUse,
    productivityOutsideOfCareer: productivityOutsideOfCareer,
    Date: Date,
    spirituality: spirituality
  })

  const savedMhJournal = await mhJournal.save()
  res.status(201).json(savedMhJournal)
})

mhJournalRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { intimateRelationships, friendships, familyRelationships, career, health, physicalWellbeing, mentalWellbeing, drugAndAlcoholUse, productivityOutsideOfCareer, Date, spirituality } = req.body
  const mhJournal = {
    intimateRelationships: intimateRelationships,
    friendships: friendships,
    familyRelationships: familyRelationships,
    career: career,
    health: health,
    physicalWellbeing: physicalWellbeing,
    mentalWellbeing: mentalWellbeing,
    drugAndAlcoholUse: drugAndAlcoholUse,
    productivityOutsideOfCareer: productivityOutsideOfCareer,
    Date: Date,
    spirituality: spirituality
  }
  const updatedMhJournal = await
  MhJournal.findByIdAndUpdate(id, mhJournal, { new: true, runValidators: true, context: 'query' })
  res.json(updatedMhJournal)
})

mhJournalRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deletedMhJournal = await MhJournal.findByIdAndDelete(id)
  console.log('journal Deleted')
  res.status(204).end()
})

module.exports = mhJournalRouter