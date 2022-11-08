import { Profile } from '@prisma/client'
import { Request } from 'express'
import { prisma } from '..'
import { AuthRequest, AuthResponse, BodyRequest, _userLevels } from '../types/types'

function formatProfileFile (file: any): string {
  return file.location || `${process.env.API_URL}/files/${file.key || file.filename}`
}

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
  findProfile: async (req: Request<{ id: string }>, res: AuthResponse<any>) => {
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
  updateProfile: async (req: BodyRequest<Profile, any, { id: string }> & AuthRequest, res: AuthResponse<any>) => {
    const { id } = req.params
    const parsedId = Number(id)
    const { id: _, picture: bodyPictureUrl, ...rest } = req.body
    const { file, userId } = req

    const picture = formatProfileFile(file)
    const data = {
      ...rest,
      ...(file ? {picture} : {})
    }

    if (userId !== parsedId) res.status(401).json('Access denied!')

    try {
      await prisma.profile.update({
        where: {
          id: parsedId,
        },
        data
      })

      res.status(200).json('Sucesso!')
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
