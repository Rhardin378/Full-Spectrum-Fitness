const express = require('express')
const app = express()
const logger = require('morgan')
const cors = require('cors')
const config = require('./utils/config')
const mongoose = require('mongoose')
const Workout = require('./models/workout')

app.use(cors())

app.use(express.json())
logger('dev')

mongoose.connect(config.MONGO_DB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message)
  })

  app.get('/api/workouts', (req, res) => {
    Workout.find({}).populate('exercises').then(workouts => {
        res.json(workouts)
    })
    })

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

app.listen(config.PORT, ()=>{
    console.log(`listening on port: ${config.PORT}`)
})