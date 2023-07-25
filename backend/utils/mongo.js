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
//workout schema
// const workoutSchema = new Schema ({
//     name: String,
//     exercises: [{type: Schema.Types.ObjectId, ref:"Exercise"}]
// })



// measurements schema

//Journal schema



//define a model
// const Set = mongoose.model('Set', setSchema)

//exercise schema
const exerciseSchema = new Schema({
    name: String,
    bodyPart: String, 
    sets: [   { reps: Number,
        weight: Number,
    }],    
    })



const Exercise = mongoose.model('Exercise', exerciseSchema)


const makeExercise = async() => {
    const exercise = new Exercise({ name: 'Leg Press', bodyPart: 'Legs' })
    exercise.sets.push({reps: 10, weight: 100 })
const res = await exercise.save()
console.log(res)
}

const addSet = async() => { 
const exercise = await Exercise.findOne({name: 'Leg Press'})
exercise.sets.push({reps: 13, weight: 103})
const res = await exercise.save()
console.log(res)
}

// makeExercise()
addSet()


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
