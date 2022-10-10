import { Request } from 'express'
import { prisma } from '..'
import { AuthResponse } from '../types/types'

const userController = {
  index: async (req: Request, res: AuthResponse<any>) => {
    try {
      const users = await prisma.user.findMany()
      res.status(200).json(users)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  }
}

export default userController

