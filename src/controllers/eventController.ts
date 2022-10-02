import { Event, EventImage } from '@prisma/client'
import dayjs from 'dayjs'
import { Multer } from 'multer'
import { client } from '..'
import { AuthRequest, AuthResponse, BodyRequest } from '../types/types'

const eventController = {
  index: async (req: BodyRequest<undefined>, res: AuthResponse<any>) => {
    try {
      const events = await client.event.findMany()
      res.status(200).json(events)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  create: async (
    req: BodyRequest<Event> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { category, lat, lng, status, datetime, icon, ...eventRest } =
      req.body
    const { userId: authorId } = req

    const data: Omit<Event, 'status'> = {
      ...eventRest,
      lat: parseFloat(String(lat)),
      lng: parseFloat(String(lng)),
      category: Number(String(category)),
      icon: Number(String(category)),
      authorId: authorId,
      datetime: new Date(datetime),
    }

    try {
      const createdEvent = await client.event.create({
        data,
      })
      const { id: eventId } = createdEvent

      const formattedImages: EventImage[] = Array.isArray(req.files)
        ? (req.files.map((file: any) => ({
            key: file.key || file.originalname,
            url:
              file.location ||
              `${process.env.API_URL}/files/${file.key || file.originalname}`,
            eventId,
          })) as unknown as EventImage[])
        : ([] as EventImage[])

      await client.eventImage.createMany({
        data: formattedImages,
      })

      res.status(200).json('success')
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
}

export default eventController
