require('dotenv').config()

const PORT = process.env.PORT || 9000
const MONGO_DB_URI = process.env.MONGO_DB_URI

module.exports = {
    PORT,
    MONGO_DB_URI
}