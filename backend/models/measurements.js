const mongoose = require("mongoose");
const { Schema } = mongoose;

//will need to use multer for image uploads
// commented out to test without image uploads
const progressPhotosSchema = new Schema({
    url: String,
    filename: String,
})

const measurementsSchema = new Schema({
weight: Number,
neck: Number,
chest: Number,
waist: Number,
hips: Number,
armR: Number,
armL: Number,
thighR: Number,
thighL: Number,
calfR: Number,
calfL: Number,
Date: Date,
progressPhotos: [progressPhotosSchema],
// commented out to test without user authentication
// user: {type: Schema.Types.ObjectId, ref:"User"}
})

module.exports = mongoose.model("Measurements", measurementsSchema)