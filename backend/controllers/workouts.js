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
	const {id} = req.params
	try {
		const workout = await Workout.findById(id).populate('exercises')
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
})

// create a workout

workoutsRouter.post('/', async (req, res, next) => {
	const {body, name, date} = req
	try {
		if(body === undefined) {
			return res.status(400).json({ error: 'content missing' })
		}

		const workout = new Workout({
			name: name,
			date: date,
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


// update a workout name and date patch instead of put because we are only updating a portion of the workout not exercises

workoutsRouter.patch('/:id', async (req, res, next) => {
	const { id } = req.params
	const { name, date } = req.body
	try {
		const workout = await Workout.findByIdAndUpdate(
			id,
			{ name: name, date: date },
			{ new: true, runValidators: true, context: 'query' })
		res.json(workout)
	}
	catch (err) {
		return next(err)
	}
})

// delete a workout
workoutsRouter.delete('/:id', async (req, res, next) => {
	const { id } = req.params
	try {
		const deletedWorkout = await Workout.findByIdAndRemove(id)
		res.status(204).end()
	} catch (err) {
		return next(err)
	}
})



module.exports = workoutsRouter