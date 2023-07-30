const mongoose = require('mongoose')
const Exercise = require('../models/exercise')
const Workout = require('../models/workout')
const Measurements = require('../models/measurements')
const { Schema } = mongoose;

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://rhardin378:${password}@cluster0.d67qiey.mongodb.net/FullSpectrumFitness?retryWrites=true&w=majority`


mongoose.set('strictQuery',false)
mongoose.connect(url).then(()=> {
    console.log(`connected to DB on ${url}`)
})




//Journal schema


// helper function to create a test exercise
const makeExercise = async() => {
    const exercise = new Exercise({ name: 'Leg Press', bodyPart: 'Legs' })
    exercise.sets.push({reps: 10, weight: 100 }, {reps:30, weight: 200}, {reps: 10, weight: 300})
const res = await exercise.save()
console.log(res)
mongoose.connection.close()
}
// helper function to add a set to an exercise
const addSet = async() => { 
const exercise = await Exercise.findOne({name: 'Leg Press'})
exercise.sets.push({reps: 13, weight: 103})
const res = await exercise.save()
console.log(res)
mongoose.connection.close()
}
// helper function to create a test workout
const makeWorkout = async() => {
    const workout = new Workout({ name: 'Leg Day', Date: new Date() })
    // const exercise = await Exercise.findOne({name: 'Leg Press'})
    // workout.exercises.push(exercise)
    const res = await workout.save()
    console.log(res)
    mongoose.connection.close()
}
//helper function to add an exercise to a workout 
const addExercise = async() => {
    const workout = await Workout.findOne({name: 'Leg Day'})
    const exercise = await Exercise.findById('64c07f7f533f51dcc34f0aa2')
    workout.exercises.push(exercise)
    const res = await workout.save()
    console.log(res)
    mongoose.connection.close()
}

const addMeasurements = async() => {
    const measurements = new Measurements({weight: 200, neck: 15, chest: 40, waist: 35, hips: 40, armR: 15, armL: 15, thighR: 25, thighL: 25, calfR: 15, calfL: 15, Date: new Date()})
    const res = await measurements.save()
    console.log(res)
    mongoose.connection.close()
}

addMeasurements()

// makeExercise()
// makeWorkout()
// addExercise()

//FIND ALL WORKOUTS AND POPULATE EXERCISES

// Workout.find({}).populate('exercises').then(result => { 
// result.forEach(element => {
    // for each workout, print the exercises' sets 
//     element.exercises.forEach(exercise => { console.log(exercise.sets)})    
// });
//     mongoose.connection.close()
// })
