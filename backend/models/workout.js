const mongoose = require("mongoose");
const Exercise = require("./exercise")
const { Schema } = mongoose;

const workoutSchema = new Schema ({
    name: String,
    Date: Date,
    exercises: [{type: Schema.Types.ObjectId, ref:"Exercise"}]
})

//may need to add helper function to delete exercises from workout when workout is deleted

module.exports = mongoose.model("Workout", workoutSchema)

