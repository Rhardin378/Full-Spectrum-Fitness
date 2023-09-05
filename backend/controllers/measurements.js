const measurementsRouter = require('express').Router()
const logger = require('../utils/logger')
const Measurement = require('../models/measurements')

measurementsRouter.get('/', async (req, res) => {
  const measurements = await Measurement.find({})
  if (measurements) {
    res.json(measurements)
  } else {
    res.status(404).end()
  }
})

measurementsRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const measurement = await Measurement.findById(id)
  if (measurement) {
    res.json(measurement)
  } else {
    res.status(404).end()
  }
})
//go back and add progress photo to model and use cloudinary to store photos
measurementsRouter.post('/', async (req, res, next) => {
  const { weight, neck, chest, waist, hips, armR, armL, thighR, thighL, calfR, calfL, Date } = req.body

  if (req.body === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  const measurement = new Measurement({
    weight: weight,
    neck: neck,
    chest: chest,
    waist: waist,
    hips: hips,
    armR: armR,
    armL: armL,
    thighR: thighR,
    thighL: thighL,
    calfR: calfR,
    calfL: calfL,
    Date: Date,
    // progressPhotos: []
  })
  const savedMeasurement = await measurement.save()
  res.status(201).json(savedMeasurement)
})

measurementsRouter.put('/:id', async (req, res, next) => {
  const { id } = req.params
  const { weight, neck, chest, waist, hips, armR, armL, thighR, thighL, calfR, calfL, Date } = req.body
  const measurements = {
    weight: weight,
    neck: neck,
    chest: chest,
    waist: waist,
    hips: hips,
    armR: armR,
    armL: armL,
    thighR: thighR,
    thighL: thighL,
    calfR: calfR,
    calfL: calfL,
    Date: Date,
    // progressPhotos: []
  }

  const updatedMeasurements = await Measurement.findByIdAndUpdate(
    id, measurements, { new: true, runValidators: true, context: 'query' })
  res.json(updatedMeasurements)
})

measurementsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params

  const deletedMeasurements = await Measurement.findByIdAndDelete(id)
  res.status(204).end()
})


module.exports = measurementsRouter