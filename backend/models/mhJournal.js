const mongoose = require('mongoose')
const { Schema } = mongoose

const mhJournalSchema = new Schema({
  intimateRelationships: String,
  friendships: String,
  familyRelationships: String,
  career: String,
  health: String,
  physicalWellbeing: String,
  mentalWellbeing: String,
  drugAndAlcoholUse: String,
  productivityOutsideOfCareer: String,
  spirituality: String,
  Date: Date
})


mhJournalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('MhJournal', mhJournalSchema)