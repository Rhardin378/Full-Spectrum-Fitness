const mongoose = require("mongoose");
const { Schema } = mongoose;

const exerciseSchema = new Schema({
  name: String,
  bodyPart: String, 
  sets: [{
       reps: Number, weight: Number
      }],
  Date: Date,
  })

  exerciseSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject._id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

 
module.exports = mongoose.model("Exercise", exerciseSchema)
