const router = require('express').Router({ mergeParams: true })
const logger = require('../utils/logger')
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')

//  create an exercise and add it to a workout route /

router.post('/', async (req, res) => {
  const { name, bodyPart, date } = req.body

  const workout = await Workout.findById(req.params.workoutId)
  logger.info(workout)
  if (!workout) {
    return res.status(404).json({ error: 'workout not found' })
  } else{
    const exercise = new Exercise({
      name: name,
      bodyPart: bodyPart,
      sets: [],
      date: date
    })
    await exercise.save()
    workout.exercises.push(exercise)
    await workout.save()
    res.status(201).json(exercise)
    logger.info(`look at that nice id:${exercise.id}`)
  }
})

module.exports = router