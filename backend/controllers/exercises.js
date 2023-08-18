const exercisesRouter = require('express').Router()
const mongoose = require('mongoose')
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')



//  create an exercise and add it to a workout route /
exercisesRouter.get('/', async (req, res, next) => {
  try {
    const exercise = await Exercise.find({})
    if (exercise) {
      res.json(exercise)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    console.log(err)
  }
})
exercisesRouter.post('/', async (req, res, next) => {
  const { name, bodyPart, date } = req.body
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error: 'content missing' })
    }
    const workout = await Workout.findById(req.params.id)
    
    const exercise = new Exercise({
      name: name,
      bodyPart: bodyPart,
      sets: [],
      date: date
    })
    
    const savedExercise = await exercise.save()
    const updatedWorkout = workout.push(savedExercise)
    res.json(updatedWorkout)
  }
  catch (err) {
    return next(err)
  }
})

// //update an exercise route
// update route for adding sets
// update route for deleting sets
// delete an exercise from a workout route

module.exports = exercisesRouter