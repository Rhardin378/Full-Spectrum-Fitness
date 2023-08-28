const exercisesRouter = require('express').Router()
const logger = require('../utils/logger')
const Exercise = require('../models/exercise')



//  create an exercise and add it to a workout route /
exercisesRouter.get('/', async (req, res, next) => {
  try {
    const exercises = await Exercise.find({})
    if (exercises) {
      logger.info(exercises)
      res.json(exercises)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    return next(err)
  }
})

exercisesRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const exercise = await Exercise.findById(id)
    if (exercise) {
      res.json(exercise)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    return next(err)
  }
})
// //update an exercise route

exercisesRouter.put('/:id', async (req, res, next) => {
  const { id } = req.params
  logger.info(id)
  logger.info(req.body)
  const { name, bodyPart, date } = req.body
  const workout = {
    name: name,
    bodyPart: bodyPart,
    date: date
  }
  logger.info(workout)
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      id, workout, { new: true, runValidators: true, context: 'query'  })
      logger.info(updatedExercise)
    res.json(updatedExercise)
  } catch (err) {
    return next(err)
  }
}
)
// update route for adding sets
// find the exercise by id and push the sets to the sets array
exercisesRouter.patch('/:id/sets', async (req, res, next) => {
  const { id } = req.params
  const { sets } = req.body
  const set = {
    reps: sets.reps,
    weight: sets.weight,

  }
  logger.info(set)
  try {
    const exercise = await Exercise.findById(id)
    logger.info(exercise)
    exercise.sets.push(set)
    const updatedExercise = await exercise.save()
    res.json(updatedExercise)
  }
  catch (err) {
    return next(err)
  }
})
// delete a set route


// delete an exercise route

exercisesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(id)
    res.status(204).end()
  }
  catch (err) {
    return next(err)
  }
})
// find the exercise by id and delete the set from the sets array by set id
exercisesRouter.delete('/:id/sets/:setId', async (req, res, next) => {
  const { id, setId } = req.params
  try {
    const exercise = await Exercise.findById(id)
    const set = exercise.sets.id(setId)
    exercise.sets.remove(set)
    const updatedExercise = await exercise.save()
    res.json(updatedExercise)
  }
  catch (err) {
    return next(err)
  }
})


module.exports = exercisesRouter