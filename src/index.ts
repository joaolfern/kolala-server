import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(
  process.env.DB_CONNECTION,
  () => console.log('Connected to DB')
)

app.listen(process.env.PORT)
