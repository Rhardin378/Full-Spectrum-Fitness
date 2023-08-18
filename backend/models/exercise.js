const mongoose = require('mongoose')
const { Schema } = mongoose

const exerciseSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1
  },
  bodyPart: {
    type: String,
    required: true,
  },
  sets: [{
    reps: {
      type: Number,
      required: true,
      default: 0,
    }, weight:{
      type: Number,
      required: true,
      default: 0,
    }
  }],
  Date: {
    type: Date,
    default: Date.now,
  }
})

exerciseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject._id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Exercise', exerciseSchema)
