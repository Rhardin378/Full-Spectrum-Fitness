const mhJournalRouter = require('express').Router()
const MhJournal = require('../models/mhJournal')

mhJournalRouter.get('/', async (req, res, next) => {
  try {
    const mhJournal = await MhJournal.find({})
    if (mhJournal) {
      res.json(mhJournal)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    console.log(err)
  }
})

mhJournalRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const mhJournal = await MhJournal.findById(id)
    if (mhJournal) {
      res.json(mhJournal)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    console.log(err)
  }
})

mhJournalRouter.post('/', async (req, res, next) => {
  const { intimateRelationships, friendships, familyRelationships, career, health, physicalWellbeing, mentalWellbeing, drugAndAlcoholUse, productivityOutsideOfCareer, Date, spirituality } = req.body
  try {
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
    res.json(savedMhJournal)
  }
  catch (err) {
    return next(err)
  }
})

mhJournalRouter.put('/:id', async (req, res, next) => { 
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
  try {
    const updatedMhJournal = await
    MhJournal.findByIdAndUpdate(id, mhJournal, { new: true, runValidators: true, context: 'query' })
    res.json(updatedMhJournal)
  }
  catch (err) {
    return next(err)
  }
})

mhJournalRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const deletedMhJournal = await MhJournal.findByIdAndDelete(id)
    console.log('journal Deleted')
    res.status(204).end()
  } catch (err) {
    return next(err)
  }
})

module.exports = mhJournalRouter