const mongoose = require('mongoose')
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

//define a schema

//set schema
// const setSchema = new Schema({
//     reps: Number,
//     weight: Number,
// })



// measurements schema

//Journal schema



//define a model
// const Set = mongoose.model('Set', setSchema)

//exercise schema
const exerciseSchema = new Schema({
    name: String,
    bodyPart: String, 
    sets: [{
         reps: Number, weight: Number
        }],
    Date: Date,
    })

// workout schema
const workoutSchema = new Schema ({
    name: String,
    Date: Date,
    exercises: [{type: Schema.Types.ObjectId, ref:"Exercise"}]
})


const Exercise = mongoose.model('Exercise', exerciseSchema)
const Workout = mongoose.model('Workout', workoutSchema)

const makeExercise = async() => {
    const exercise = new Exercise({ name: 'Leg Press', bodyPart: 'Legs' })
    exercise.sets.push({reps: 10, weight: 100 })
const res = await exercise.save()
console.log(res)
mongoose.connection.close()
}

const addSet = async() => { 
const exercise = await Exercise.findOne({name: 'Leg Press'})
exercise.sets.push({reps: 13, weight: 103})
const res = await exercise.save()
console.log(res)
mongoose.connection.close()
}

const makeWorkout = async() => {
    const workout = new Workout({ name: 'Leg Day', Date: new Date() })
    const exercise = await Exercise.findOne({name: 'Leg Press'})
    workout.exercises.push(exercise)
    const res = await workout.save()
    console.log(res)
    mongoose.connection.close()
}

const addExercise = async() => {
    const workout = await Workout.findOne({name: 'Leg Day'})
    const exercise = await Exercise.findById('64b8a4c664d75dddfcbd1720')
    workout.exercises.push(exercise)
    const res = await workout.save()
    console.log(res)
    mongoose.connection.close()
}

// makeExercise()
// makeWorkout()
addExercise()

// Exercise.find({}).then(result=> {
//     result.forEach(exercise=> {
//         console.log(`${exercise.name}`)  
//     } )
// }
//     )
// const Note = mongoose.model('Note', noteSchema)

//create new workout object in a variable to save
// const workout = new Workout({
//     []
// })

//save and console log    example   workout.save().then(result => { 
    // console.log('workout saved!')
    //   mongoose.connection.close()
    // })

// 

// Note.find({}).then(result => {
//     result.forEach(note => {
//         console.log(`${note.content} important: ${note.important}`)
//     })
//     mongoose.connection.close()
// })
