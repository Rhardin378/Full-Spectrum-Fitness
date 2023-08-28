const mongoose = require('mongoose')
const { Schema } = mongoose

const mhJournalSchema = new Schema({
  intimateRelationships: { type: String, default: '' },
  friendships: { type: String, default: '' },
  familyRelationships: { type: String, default: '' },
  career: { type: String, default: '' },
  health: { type: String, default: '' },
  physicalWellbeing: { type: String, default: '' },
  mentalWellbeing: { type: String, default: '' },
  drugAndAlcoholUse: { type: String, default: '' },
  productivityOutsideOfCareer: { type: String, default: '' },
  spirituality: { type: String, default: '' },
  Date: { type: Date, default: Date.now }
})


mhJournalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('MhJournal', mhJournalSchema)