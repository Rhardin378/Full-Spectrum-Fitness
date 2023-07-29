const mongoose = require('mongoose')
const Exercise = require('../models/exercise')
const Workout = require('../models/workout')
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



// measurements schema

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

// makeExercise()
makeWorkout()
// addExercise()

//find all workouts and populate the exercises
// Workout.find({}).populate('exercises').then(result => { 
// result.forEach(element => {
    // for each workout, print the exercises' sets 
//     element.exercises.forEach(exercise => { console.log(exercise.sets)})    
// });
//     mongoose.connection.close()
// })
