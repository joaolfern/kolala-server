import { Request } from 'express'
import { prisma } from '..'
import { AuthRequest, AuthResponse, BodyRequest, _userLevels } from '../types/types'

const userController = {
  index: async (req: Request, res: AuthResponse<any>) => {
    try {
      const users = await prisma.user.findMany()
      res.status(200).json(users)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  profile: async (req: Request<{ id: string }>, res: AuthResponse<any>) => {
    const { id } = req.params
    const parsedId = Number(id)

    try {
      const data = await prisma.profile.findUnique({
        where: {
          id: parsedId,
        },
        include: {
          User: true
        }
      })

      res.status(200).json({ data })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  promote: async (
    req: BodyRequest<{ level: _userLevels }, undefined, { targetId: string }> &
      AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { level } = req.body
    const authorId = Number(req.userId)
    const targetId = Number(req.params.targetId)

    try {

      const author = await prisma.user.findUnique({
        where: {
          id: authorId
        }
      })

      if (author.level === 'user') res.status(4001).json('Access Denied!')

      await prisma.user.update({
        where: {
          id: targetId,
        },
        data: {
          level
        }
      })

      res.status(200).json('Sucesso!')
    } catch (err) {
      console.error(err)
    }
  },
  createReport: async (
    req: BodyRequest<{ category: string }, undefined, { targetId: string }> &
      AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { body } = req
    const targetId = Number(req.params.targetId)
    const authorId = Number(req.userId)
    const category = Number(body.category)
    try {
    } catch (err) {
      await prisma.report.create({
        data: {
          authorId,
          category,
          targetId,
        },
      })

      res.status(200).json('Sucesso!')
    }
  },
}

export default userController
