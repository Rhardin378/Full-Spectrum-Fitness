const router = require('express').Router({ mergeParams: true })
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')
const mongoose = require('mongoose')

//  create an exercise and add it to a workout route /

router.post('/', async (req, res, next) => {
  const { name, bodyPart, date } = req.body
  try {
    console.log(req.params.workoutId)
    const workout = await Workout.findById(req.params.workoutId)
    console.log(workout)
    if (!workout) {
      return res.status(404).json({ error: 'workout not found' })
    }
    const exercise = new Exercise({
      name: name,
      bodyPart: bodyPart,
      sets: [],
      date: date
    })
    await exercise.save()
    workout.exercises.push(exercise)
    await workout.save()
    res.json(exercise)
    console.log(`look at that nice id:${exercise.id}`)


  }
  catch (err) {
    return next(err)

  }
})

module.exports = router