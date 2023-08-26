const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const config = require('./utils/config')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const workoutsRouter = require('./controllers/workouts')
const exercisesRouter = require('./controllers/exercises')
const addExercisesRouter = require('./controllers/addExercises')
const middleware = require('./utils/middleware')
const measurementsRouter = require('./controllers/measurements')
const mhJournalRouter = require('./controllers/mhJournal')


app.use(cors())

app.use(express.json())
app.use(middleware.requestLogger)
app.use(morgan('dev'))

mongoose.connect(config.MONGO_DB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message)
  })


app.use('/api/workouts', workoutsRouter)
app.use('/api/workouts/:workoutId/exercises', addExercisesRouter)
app.use('/api/exercises', exercisesRouter )
app.use('/api/measurements', measurementsRouter)
app.use('/api/mhjournals', mhJournalRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

app.listen(config.PORT, () => {
  console.log(`listening on port: ${config.PORT}`)
})