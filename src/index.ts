import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import unauthRouter from './routes/unauthRouter'
import { terminalMiddleware } from './middlewares/terminal'
import verify from './middlewares/verify'
import authRouter from './routes/authRouter'

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

app.use('/auth', verify, authRouter)
app.use('/unauth', unauthRouter)

app.listen(process.env.DB_CONNECTION, () => console.log(`Listening at ${process.env.DB_CONNECTION}`))
export const prisma = new PrismaClient()
