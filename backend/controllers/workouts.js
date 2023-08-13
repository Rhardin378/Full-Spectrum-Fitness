const workoutsRouter = require('express').Router()
const mongoose = require('mongoose')
const Workout = require('../models/workout')
const Exercise = require('../models/exercise')

// routes for workouts
// actual route is /api/workouts will use workoutsRouter to handle

// get all workouts


workoutsRouter.get('/', async (req, res, next) => {
	try {
		const workout = await Workout.find({}).populate('exercises')
		if (workout) {
			res.json(workout)
		} else {
			res.status(404).end()
		}
	}
	catch (err) {
		console.log(err)
	}
})

// // get a single workout

workoutsRouter.get('/:id', async (req, res, next) => {
	try {
		const workout = await Workout.findById(req.params.id).populate('exercises')
		if (workout) {
			res.json(workout)
		} else {
			res.status(404).end()
		}
	}
	catch (err) {
		console.log(err)
		return next(err)
	}
	mongoose.connection.close()
})

// create a workout

workoutsRouter.post('/', async (req, res, next) => {
	const body = req.body
	try {
		if(body === undefined) {
			return res.status(400).json({ error: 'content missing' })
		}

		const workout = new Workout({
			name: body.name,
			date: body.date,
			exercises: []

		})
		const savedWorkout = await workout.save()
		mongoose.connection.close()
		res.json(savedWorkout)
	}
	catch (err) {
		return next(err)
	}
	mongoose.connection.close()
})


// update a workout

//add an exercise to a workout

// delete an exercise from a workout

// delete a workout

module.exports = workoutsRouter