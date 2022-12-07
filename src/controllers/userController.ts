import { Profile } from '@prisma/client'
import { Request } from 'express'
import { prisma } from '..'
import {
  AuthRequest,
  AuthResponse,
  BodyRequest,
  _userLevels,
} from '../types/types'

function formatProfileFile(file: any): string {
  return (
    file?.location ||
    `${process.env.API_URL}/files/${
      file.key || file.filename.replace(/ /g, '-')
    }`
  )
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
          User: true,
        },
      })

      res.status(200).json({ data })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  updateProfile: async (
    req: BodyRequest<Profile, any, { id: string }> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { id } = req.params
    const parsedId = Number(id)
    const { id: _, picture: bodyPictureUrl, ...rest } = req.body
    const { file, userId } = req

    const picture = file ? formatProfileFile(file) : undefined
    const data = {
      ...rest,
      ...(file ? { picture } : {}),
    }

    if (userId !== parsedId) return res.status(401).json('Access denied!')

    try {
      await prisma.profile.update({
        where: {
          id: parsedId,
        },
        data,
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
          id: authorId,
        },
      })

      if (author.level === 'user') res.status(4001).json('Access denied!')

      await prisma.user.update({
        where: {
          id: targetId,
        },
        data: {
          level,
        },
      })

      res.status(200).json('Sucesso!')
    } catch (err) {
      console.error(err)
      res.status(400).json(err)
    }
  },
  updateStatus: async (
    req: BodyRequest<{ status: string }, undefined, { targetId: string }> &
      AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { body, params, userId: authorId } = req
    const status = Number(body.status)
    const targetId = Number(params.targetId)

    try {
      const author = await prisma.user.findUnique({
        where: {
          id: authorId,
        },
      })

      if (author.level === 'user') res.status(4001).json('Access denied!')

      async function banUser(id: number) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            status,
          },
        })
      }

      await banUser(targetId)
    } catch (err) {
      console.error(err)
      res.status(400).json(err)
    }
  }
}

export default userController
