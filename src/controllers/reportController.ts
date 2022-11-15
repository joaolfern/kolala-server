import { Report } from '@prisma/client'
import { prisma } from '..'
import { AuthRequest, AuthResponse, BodyRequest } from '../types/types'
import userController from './userController'

const reportController = {
  create: async (
    req: BodyRequest<{
      category: string
      targetId: string
      description?: string
    }> &
      AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { body, userId: authorId } = req
    const category = Number(body.category)
    const targetId = Number(body.targetId)
    const { description } = body

    try {
      await prisma.report.create({
        data: {
          category,
          authorId,
          targetId,
          description,
        },
      })

      res.status(200).json('Sucess')
    } catch (err) {
      console.error(err)
      res.status(400).json(err)
    }
  },
  update: async (
    req: BodyRequest<{ status: string }, any, { id: string }> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { body, userId, params } = req
    const id = Number(params.id)
    const status = Number(body.status)
    const shouldBanUser = status === 1

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      const isAdmin = user.level === 'admin'
      if (!isAdmin) return res.status(401).json('Access denied!')

      const updatedReport = await prisma.report.update({
        where: {
          id,
        },
        data: {
          status,
        },
      })

      async function banUser(id: number) {
        await prisma.user.update({
          where: {
            id
          },
          data: {
            status: 0
          }
        })
      }

      if (shouldBanUser) await banUser(updatedReport.targetId)
      res.status(200).json('Sucess')
    } catch (err) {
      console.error(err)
      res.status(400).json(err)
    }
  },
  list: async (
    req: BodyRequest<any, any> & AuthRequest,
    res: AuthResponse<{ data: Report[] }>
  ) => {
    const { userId } = req

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      const isAdmin = user.level === 'admin'

      const data = await prisma.report.findMany({
        where: !isAdmin
          ? {
              authorId: userId,
            }
          : {},
        include: {
          target: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json({ data })
    } catch (err) {
      console.error(err)
      res.status(400).json(err)
    }
  },
}

export default reportController
