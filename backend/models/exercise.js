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

const Exercise = mongoose.model("exercise", exerciseSchema)

module.exports = Exercise;