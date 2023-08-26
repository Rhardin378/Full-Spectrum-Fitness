const measurementsRouter = require('express').Router()
const Measurement = require('../models/measurements')

measurementsRouter.get('/', async (req, res, next) => {
  try {
    const measurements = await Measurement.find({})
    if (measurements) {
      res.json(measurements)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    console.log(err)
  }
}
)
//go back and add progress photo to model and use cloudinary to store photos
measurementsRouter.post('/', async (req, res, next) => {
  const { weight, neck, chest, waist, hips, armR, armL, thighR, thighL, calfR, calfL, Date } = req.body
  try {
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
    res.json(savedMeasurement)
  }
  catch (err) {
    return next(err)
  }
})

module.exports = measurementsRouter