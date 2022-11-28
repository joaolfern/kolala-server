import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import unauthRouter from './routes/unauthRouter'
import { terminalMiddleware } from './middlewares/terminal'
import verify from './middlewares/verify'
import authRouter from './routes/authRouter'
import http from 'http'
import io from 'socket.io'
import { chatSocketRouter } from './routes/chatRouter'

dotenv.config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(terminalMiddleware)

const server = http.createServer(app)

app.use(cors())

const socketIO = new io.Server(server, {
  cors: {
    origin: '*',
  },
})

chatSocketRouter(socketIO)

app.use('/files', express.static(__dirname + '/temp/uploads'))

app.use('/auth', verify, authRouter)
app.use('/unauth', unauthRouter)

server.listen(process.env.PORT, () =>
  console.log(`Listening at ${process.env.PORT}`)
)
export const prisma = new PrismaClient()
