const workoutsRouter = require('express').Router()
const logger = require('../utils/logger')
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')

// routes for workouts
// actual route is /api/workouts will use workoutsRouter to handle

// get all workouts


workoutsRouter.get('/', async (req, res) => {
  const workout = await Workout.find({}).populate('exercises')
  if (workout) {
    res.json(workout)
  } else {
    res.status(404).end()
  }
})

// // get a single workout

workoutsRouter.get('/:id', async (req, res) => {
  const { id } = req.params
  // populated paths are no longer set to their original _id value but are replaced with the mongoose document returned from the database by performing a separate query before returning the results to the application. Arrays or refs are populated the same way
  const workout = await Workout.findById(id).populate('exercises')
  if (workout) {
    res.json(workout)
  } else {
    res.status(404).end()
  }
})

// create a workout

workoutsRouter.post('/', async (req, res) => {
  const { name, date } = req.body

  if(req.body === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  const workout = new Workout({
    name: name,
    date: date,
    exercises: []

  })
  const savedWorkout = await workout.save()
  res.status(201).json(savedWorkout)
  // mongoose.connection.close()
})


// update a workout name and date patch instead of put because we are only updating a portion of the workout not exercises

workoutsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { name, date } = req.body

  const workout = await Workout.findByIdAndUpdate(
    id,
    { name: name, date: date },
    { new: true, runValidators: true, context: 'query' })
  res.json(workout)
})

// delete a workout
workoutsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params

  const deletedWorkout = await Workout.findByIdAndDelete(id)
  res.status(204).end()
})



module.exports = workoutsRouter