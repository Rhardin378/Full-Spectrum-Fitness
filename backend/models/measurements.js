const mongoose = require('mongoose')
const { Schema } = mongoose

//will need to use multer for image uploads
// commented out to test without image uploads
const progressPhotosSchema = new Schema({
  url: String,
  filename: String,
})

const measurementsSchema = new Schema({
  weight: {
    type: Number,
    default: 0,
  },
  neck: {
    type: Number,
    default: 0,
  },
  chest: {
    type: Number,
    default: 0,
  },
  waist: {
    type: Number,
    default: 0,
  },
  hips: {
    type: Number,
    default: 0,
  },
  armR: {
    type: Number,
    default: 0,
  },
  armL: {
    type: Number,
    default: 0,
  },
  thighR: {
    type: Number,
    default: 0,
  },
  thighL: {
    type: Number,
    default: 0,
  },
  calfR: {
    type: Number,
    default: 0,
  },
  calfL: {
    type: Number,
    default: 0,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  // progressPhotos: [progressPhotosSchema],
// commented out to test without user authentication
// user: {type: Schema.Types.ObjectId, ref:"User"}
})


measurementsSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Measurements', measurementsSchema)