
import { Router } from 'express'
import { ChatSocketController, chatController } from '../controllers/chatController'
import { ChatIo } from '../types/types'

const chatSocketRouter = (socketIO: ChatIo.Server) => {
  socketIO.on('connection', socket => {
    console.log(`⚡: ${socket.id} user just connected!`)
    const chatSocketController = new ChatSocketController(socket)

    socket.on('joinChat', chatSocketController.joinChat)
    socket.on('sendMessage', chatSocketController.sendMessage)
    socket.on('disconnect', chatSocketController.disconnect)
  })
}

const chatRouter = Router()
chatRouter.get('/:eventId', chatController.list)

export { chatSocketRouter, chatRouter }
