const router = require('express').Router({ mergeParams: true })
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')
const { default: mongoose } = require('mongoose')

//  create an exercise and add it to a workout route /

router.post('/', async (req, res, next) => {
  try {
    console.log(req.params.workoutId)
    const workout = await Workout.findById(req.params.workoutId)
    const { name, bodyPart, date } = req.body
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
    workout.exercises.push(exercise)
    await exercise.save()
    await workout.save()
    res.json(exercise)



  }
  catch (err) {
    return next(err)

  }
})

module.exports = router