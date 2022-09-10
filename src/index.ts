import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import userRouter from './routes/userRouter'
import eventRouter from './routes/eventRouter'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/auth/users', userRouter)
app.use('/auth/events', eventRouter)

app.listen(process.env.DB_CONNECTION, () => console.log(`Listening at ${process.env.DB_CONNECTION}`))
export const client = new PrismaClient()
