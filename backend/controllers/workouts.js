const workoutsRouter = require('express').Router();
const { default: mongoose } = require('mongoose');
const Workout = require('../models/workout');

// routes for workouts

workoutsRouter.get('/', async (req, res, next) => {
    try {
        const workouts = await Workout.find({}).populate('exercises')
        res.json(workouts)
    }
    catch (err) {
        console.log(err)
    }

    mongoose.connection.close()
})


// get all workouts

// get a single workout

// create a workout

// update a workout

//add an exercise to a workout

// update an exercise in a workout

// delete a workout

module.exports = workoutsRouter;