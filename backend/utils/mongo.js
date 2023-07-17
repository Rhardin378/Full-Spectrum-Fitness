const mongoose = require('mongoose')


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


//define a model

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
