import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { Mensage, PrismaClient } from '@prisma/client'
import unauthRouter from './routes/unauthRouter'
import { terminalMiddleware } from './middlewares/terminal'
import verify from './middlewares/verify'
import authRouter from './routes/authRouter'
import { createServer } from "http";
dotenv.config()

const app = express()

import { socketConnection, socketInitialize } from './utils/socket'

const httpServer = createServer(app);

const io = socketInitialize(httpServer)
socketConnection(io)

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


io.on('sendMessage', (socket) => {
  console.log('connectado')
  io.emit('updateMessages')
});
