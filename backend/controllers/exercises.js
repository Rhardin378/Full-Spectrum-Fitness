const exercisesRouter = require('express').Router()
const logger = require('../utils/logger')
const Exercise = require('../models/exercise')



//  create an exercise and add it to a workout route /
exercisesRouter.get('/', async (req, res) => {
  const exercises = await Exercise.find({})
  if (exercises) {
    logger.info(exercises)
    res.json(exercises)
  } else {
    res.status(404).end()
  }
})

exercisesRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const exercise = await Exercise.findById(id)
  if (exercise) {
    res.json(exercise)
  } else {
    res.status(404).end()
  }
})
// //update an exercise route

exercisesRouter.put('/:id', async (req, res) => {
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

  const updatedExercise = await Exercise.findByIdAndUpdate(
    id, workout, { new: true, runValidators: true, context: 'query'  })
  logger.info(updatedExercise)
  res.json(updatedExercise)
})
// update route for adding sets
// find the exercise by id and push the sets to the sets array
exercisesRouter.patch('/:id/sets', async (req, res) => {
  const { id } = req.params
  const { sets } = req.body
  const set = {
    reps: sets.reps,
    weight: sets.weight,

  }
  logger.info(set)

  const exercise = await Exercise.findById(id)
  logger.info(exercise)
  exercise.sets.push(set)

  const updatedExercise = await exercise.save()
  res.json(updatedExercise)

})
// delete a set route


// delete an exercise route

exercisesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deletedExercise = await Exercise.findByIdAndDelete(id)
  res.status(204).end()
})

// find the exercise by id and delete the set from the sets array by set id
exercisesRouter.delete('/:id/sets/:setId', async (req, res) => {
  const { id, setId } = req.params

  const exercise = await Exercise.findById(id)
  const set = exercise.sets.id(setId)
  exercise.sets.remove(set)
  const updatedExercise = await exercise.save()
  res.json(updatedExercise)
})


module.exports = exercisesRouter