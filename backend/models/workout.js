const mongoose = require("mongoose");
const Exercise = require("./exercise")
const { Schema } = mongoose;

const workoutSchema = new Schema ({
    name: String,
    Date: Date,
    exercises: [{type: Schema.Types.ObjectId, ref:"Exercise"}]
})

//may need to add helper function to delete exercises from workout when workout is deleted

workoutSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
module.exports = mongoose.model("Workout", workoutSchema)

