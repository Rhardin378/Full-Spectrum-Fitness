const exercisesRouter = require('express').Router()
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')



//  create an exercise and add it to a workout route /
exercisesRouter.get('/', async (req, res, next) => {
  try {
    const exercises = await Exercise.find({})
    if (exercises) {
      console.log(exercises)
      res.json(exercises)
    } else {
      res.status(404).end()
    }
  }
  catch (err) {
    console.log(err)
  }
})
// exercisesRouter.post('/', async (req, res, next) => {
//   const { name, bodyPart, date } = req.body
//   try {
//     if (req.body === undefined) {
//       return res.status(400).json({ error: 'content missing' })
//     }
//     const workout = await Workout.findById(req.params.id)
//     const exercise = new Exercise({
//       name: name,
//       bodyPart: bodyPart,
//       sets: [],
//       date: date
//     })
//     const savedExercise = await exercise.save()
//     const updatedWorkout = workout.push(savedExercise)
//     res.json(updatedWorkout)
//   }
//   catch (err) {
//     return next(err)
//   }
// })
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
    console.log(err)
    return next(err)
  }
})
// //update an exercise route

exercisesRouter.put('/:id', async (req, res, next) => {
  const { id } = req.params
  console.log(id)
  console.log(req.body)
  const { name, bodyPart, date } = req.body
  const workout = {
    name: name,
    bodyPart: bodyPart,
    date: date
  }
  console.log(workout)
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      id, workout, { new: true, runValidators: true, context: 'query'  })
    console.log(updatedExercise)
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
  console.log(set)
  try {
    const exercise = await Exercise.findById(id)
    console.log(exercise)
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