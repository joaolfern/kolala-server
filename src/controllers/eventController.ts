import { Event, EventImage } from '@prisma/client'
import dayjs from 'dayjs'
import { Multer } from 'multer'
import { client } from '..'
import { AuthRequest, AuthResponse, BodyRequest } from '../types/types'

type EventListDatabaseItem =(Event & {
    EventImage: {
      url: string
    }[]
  })


function formatEventListItem({  EventImage, ...item }: EventListDatabaseItem) {
  return {
    ...item,
    image: EventImage[0]?.url

  }
}

const eventController = {
  index: async (req: BodyRequest<{}> & AuthRequest, res: AuthResponse<any>) => {
    const { userId } = req
    try {
      const [rawOrganizingEvents, rawParticipatingEvents] = await Promise.all([
        await client.event.findMany({
          where: {
            authorId: userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            EventImage: {
              select: {
                url: true,
              },
            },
          },
        }),
        await client.event.findMany({
          where: {
            Atendee: {
              some: {
                userId,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            EventImage: {
              select: {
                url: true,
              },
            },
          },
        }),
      ])


      const organizingEvents = rawOrganizingEvents.map(formatEventListItem)
      const participatingEvents = rawParticipatingEvents.map(formatEventListItem)

      const data = {
        organizingEvents,
        participatingEvents,
      }
      res.status(200).json({ data })
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
        ? (req.files.map((file: any) => {
          return ({
            key: file.key || file.filename,
            url:
              file.location ||
              `${process.env.API_URL}/files/${file.key || file.filename}`,
            eventId,
          })
        }) as unknown as EventImage[])
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
