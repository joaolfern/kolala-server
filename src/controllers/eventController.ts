import { Event } from '@prisma/client'
import { Request } from 'express'
import { client } from '..'
import { AuthResponse } from '../types/types'

const eventController = {
  index: async (req: Request, res: AuthResponse<any>) => {
    try {
      const events = await client.event.findMany()
      res.status(200).json(events)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  create: async (req: Request<{}, any, Event>, res:  AuthResponse<any>) => {
    const data = req.body

    try {
      const events = await client.event.create({
        data
      })
      res.status(200).json(events)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
}

export default eventController

