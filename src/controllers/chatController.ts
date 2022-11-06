import { prisma } from '..'
import { decryptToken } from '../middlewares/verify'
import { AuthRequest, AuthResponse, ChatIo, BodyRequest } from '../types/types'

class ChatSocketController {
  private socket: ChatIo.Socket
  private eventId: string | undefined
  private authorId: number | undefined

  constructor(socket: ChatIo.Socket) {
    this.socket = socket
    const token: string = socket.handshake.auth.token
    const { userId } = decryptToken(token)
    this.authorId = userId

    this.joinChat = this.joinChat.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.deleteMessage = this.deleteMessage.bind(this)
  }


  joinChat({ eventId }: { eventId: string }) {
    this.eventId = String(eventId)
    this.socket.join(this.eventId)
  }

  async sendMessage(args: ISendMessageRequest) {
    const eventId = Number(this.eventId)
    const data = {
      eventId,
      authorId: this.authorId,
      ...args,
    }

    try {
      const response = await prisma.message.create({
        data,
        include: {
          author: true,
          answerTo: true,
        }
       })


      this.socket.emit('newMessage', response)
    } catch (err) {
      console.log(err)
    }
  }

  async deleteMessage({ id }: { id: number }) {
    try {
      const message = await prisma.message.findUnique({
        where: {
          id
        }
      })

      if (message.authorId !== this.authorId) throw new Error('Access denied')

      const response = await prisma.message.delete({
        where: {
          id
        }
      })

      this.socket.emit('deleteMessageFromDisplay', response.id)
    } catch (err) {
      console.log(err)
    }
  }

  disconnect() {
    this.socket.disconnect()
  }
}

interface ISendMessageRequest {
  content: string
  answerToId?: number
}

const chatController = {
  list: async (req: BodyRequest<any, any, { eventId: string }> & AuthRequest, res: AuthResponse<any>) => {
    const eventId = Number(req.params.eventId)

    try {
      const data = await prisma.message.findMany({
        where: {
          eventId,
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          answerTo: true,
          author: true,
        }
      })

      res.status(200).json({ data })
    } catch (err) {
      console.log(err)
    }
  },
}

export { ChatSocketController, chatController }
