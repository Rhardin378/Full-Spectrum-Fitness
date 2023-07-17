const express = require('express')
const app = express()
const logger = require('morgan')
const cors = require('cors')
const config = require('./utils/config')

app.use(cors())

app.use(express.json())
logger('dev')

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

app.listen(config.PORT, ()=>{
    console.log(`listening on port: ${config.PORT}`)
})