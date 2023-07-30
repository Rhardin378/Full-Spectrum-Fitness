const mongoose = require("mongoose");
const { Schema } = mongoose;

const mhJournalSchema = new Schema({
    intimateRelationships: String,
    familyRelationships: String,
    career: String,
    health: String,
    physicalWellBeing: String,
    mentalWellBeing: String,
    drugAndAlcoholUse: String,
    productivityOutsideOfCareer: String,
    createdAt: Date
})

module.exports = mongoose.model("mhJournal", mhJournalSchema)