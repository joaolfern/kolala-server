import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import userRouter from './routes/userRouter'
import eventRouter from './routes/eventRouter'
import unauthRouter from './routes/unauthRouter'
import { terminalMiddleware } from './middlewares/terminal'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(terminalMiddleware)

app.use(
  '/files',
  express.static(__dirname + '/temp/uploads')
)

app.use('/auth/users', userRouter)
app.use('/auth/events', eventRouter)
app.use('/unauth', unauthRouter)

app.listen(process.env.DB_CONNECTION, () => console.log(`Listening at ${process.env.DB_CONNECTION}`))
export const client = new PrismaClient()
