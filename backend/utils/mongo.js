const mongoose = require('mongoose')
const Exercise = require('../models/exercise')
const Workout = require('../models/workout')
const Measurements = require('../models/measurements')
const MhJournal = require('../models/mhJournal')


if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://rhardin378:${password}@cluster0.d67qiey.mongodb.net/FullSpectrumFitness?retryWrites=true&w=majority`


mongoose.set('strictQuery',false)
mongoose.connect(url).then(() => {
  console.log(`connected to DB on ${url}`)
})




//Journal schema


// helper function to create a test exercise
const makeExercise = async() => {
  const exercise = new Exercise({ name: 'Leg Curls', bodyPart: 'Legs' })
  const res = await exercise.save()
  console.log(res)
  mongoose.connection.close()
}
// helper function to add a set to an exercise
const addSet = async() => {
  const exercise = await Exercise.findById('64cda25e2db0968b66de0ab5')
  exercise.sets.push({ reps: 13, weight: 103 })
  const res = await exercise.save()
  console.log(res)
  mongoose.connection.close()
}
// helper function to create a test workout
const makeWorkout = async() => {
  const workout = new Workout({ name: 'Cj pump series leg Day', Date: new Date() })
  // const exercise = await Exercise.findOne({name: 'Leg Press'})
  // workout.exercises.push(exercise)
  const res = await workout.save()
  console.log(res)
  mongoose.connection.close()
}
//helper function to add an exercise to a workout
const addExercise = async() => {
  const workout = await Workout.findOne({ name: 'Cj pump series leg Day' })
  const exercise = await Exercise.findById('64cda7c71bf1e232cf92be25')
  workout.exercises.push(exercise)
  const res = await workout.save()
  console.log(res)
  mongoose.connection.close()
}

//helper function to create test measurements

const addMeasurements = async() => {
  const measurements = new Measurements({ weight: 200, neck: 15, chest: 40, waist: 35, hips: 40, armR: 15, armL: 15, thighR: 25, thighL: 25, calfR: 15, calfL: 15, Date: new Date() })
  const res = await measurements.save()
  console.log(res)
  mongoose.connection.close()
}

const addMhJournal = async() => {
  const mhJournal = new MhJournal({ intimateRelationships: 'good', familyRelationships: 'good', career: 'good', health: 'good', physicalWellBeing: 'good', mentalWellBeing: 'good', drugAndAlcoholUse: 'good', productivityOutsideOfCareer: 'good', createdAt: new Date() })
  const res = await mhJournal.save()
  console.log(res)
  mongoose.connection.close()
}

//Functions to create test data
// addMeasurements()

// makeWorkout()
// makeExercise()
// addSet()
// addExercise()

// addMhJournal()

//FIND ALL WORKOUTS AND POPULATE EXERCISES
// Workout.find({}).then(result => {
//     console.log(result)
//     mongoose.connection.close()
// })
// Workout.find({}).populate('exercises').then(result => {
//     console.log(result)
//     mongoose.connection.close()
// })0
//working find function for finding all workouts and populating exercises
// Workout.find({}).populate('exercises').then(result => {
//     console.log(`workout has ${result.length} exercises`)
//     console.log(result.forEach(workout => {
//         console.log(`${workout.name}`)
//         console.log(`${workout.exercises}`)
//     }))
//     mongoose.connection.close()
// })

//find single workout
Workout.findById('64cda1c9d970dc4c62b9fef6').then(result => {
  console.log(result)
  mongoose.connection.close()
})

// find all mhJournals
// MhJournal.find({}).then(result => {
//     console.log(result)
//     mongoose.connection.close()
// })

//find all measurements
// Measurements.find({}).then(result => {
//     console.log(result)
//         mongoose.connection.close()
// })