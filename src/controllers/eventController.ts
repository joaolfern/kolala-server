import { Event, EventImage } from '@prisma/client'
import { prisma } from '..'
import { AuthRequest, AuthResponse, BodyRequest } from '../types/types'
import { Request as expressRequest } from 'express'

type EventListDatabaseItem = Event & {
  EventImage: {
    url: string
  }[]
}

function formatEventListItem({ EventImage, ...item }: EventListDatabaseItem) {
  return {
    ...item,
    image: EventImage[0]?.url,
  }
}

function formatEventImageFiles(
  files:
    | {
        [fieldname: string]: Express.Multer.File[]
      }
    | Express.Multer.File[]
) {
  const formattedImages: Omit<Omit<EventImage, 'eventId'>, 'id'>[] =
    Array.isArray(files)
      ? files.map((file: any) => {
          return {
            key: file.key || file.filename,
            url:
              file.location ||
              `${process.env.API_URL}/files/${file.key || file.filename}`,
          }
        })
      : []

  return formattedImages
}

function parseStringfiedData({
  category,
  lat,
  lng,
  datetime,
  icon,
}: {
  category: any
  lat: any
  lng: any
  datetime: any
  icon: any
}) {
  return {
    lat: parseFloat(String(lat)),
    lng: parseFloat(String(lng)),
    category: Number(String(category)),
    icon: Number(String(icon)),
    datetime: new Date(datetime),
  }
}

const eventController = {
  index: async (req: BodyRequest<{}> & AuthRequest, res) => {
    const { userId } = req
    try {
      const [rawOrganizingEvents, rawParticipatingEvents] = await Promise.all([
        await prisma.event.findMany({
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
        await prisma.event.findMany({
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
      const participatingEvents =
        rawParticipatingEvents.map(formatEventListItem)

      const data = [
        {
          title: 'Organizando',
          data: organizingEvents,
        },
        {
          title: 'Participando',
          data: participatingEvents,
        },
      ]

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
    const { userId: authorId, files } = req

    const formattedImages = formatEventImageFiles(files)
    const parsedData = parseStringfiedData({
      category,
      lat,
      lng,
      datetime,
      icon,
    })

    try {
      await prisma.event.create({
        data: {
          ...eventRest,
          ...parsedData,
          authorId,
          EventImage: {
            createMany: {
              data: formattedImages,
            },
          },
        },
      })

      res.status(200).json('success')
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  update: async (
    req: BodyRequest<Event & { removedImages: string[] }, any, { id: string }> &
      AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { removedImages = [], id: eventId, category, lat, lng, status, datetime, icon, ...event } = req.body
    const { id } = req.params
    const parsedId = Number(id)
    const { userId, files } = req

    const parsedData = parseStringfiedData({
      category,
      lat,
      lng,
      datetime,
      icon,
    })

    try {
      const currentEvent = await prisma.event.findUnique({
        where: {
          id: parsedId,
        },
      })

      const isUserAuthor = currentEvent.authorId === userId
      if (!isUserAuthor)
        return res.status(400).json({ message: 'Usuário inválido' })

      const parsedRemovedImages = removedImages.map(id => Number(id))
      const newEventImages = formatEventImageFiles(files)

      await Promise.all([
        prisma.eventImage.deleteMany({
          where: {
            id: {
              in: parsedRemovedImages,
            },
          },
        }),
        prisma.event.update({
          data: {
            ...event,
            ...parsedData,
            EventImage: {
              createMany: {
                data: newEventImages,
              },
            },
          },
          where: {
            id: parsedId,
          },
        }),
      ])

      res.status(200).json({ data: 'Evento atualizado com sucesso!' })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  delete:  async (
    req: BodyRequest<any, any, { id: string }> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { id } = req.params
    const parsedId = Number(id)
    const { userId } = req

    try {
      const currentEvent = await prisma.event.findUnique({
        where: {
          id: parsedId,
        },
      })

      const isUserAuthor = currentEvent.authorId === userId
      if (!isUserAuthor)
      return res.status(400).json({ message: 'Usuário inválido' })

      await prisma.event.delete({
        where: {
          id: parsedId,
        },
      })

      res.status(200).json({ data: 'Evento deletado com sucesso!' })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },

  map: async (
    req: expressRequest<any, { lat: number; lng: number }, Event> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const lat = parseFloat(String(req.query.lat))
    const lng = parseFloat(String(req.query.lng))

    try {
      const data = await prisma.$queryRaw`
      SELECT id, icon, lat, lng, title, ROUND(earth_distance(ll_to_earth(${lat}, ${lng}), ll_to_earth(lat, lng))::NUMERIC, 2) AS distance
      FROM
      "Event"
      WHERE
      earth_box(ll_to_earth (${lat}, ${lng}), 10000) @> ll_to_earth (lat, lng)
      AND earth_distance(ll_to_earth (${lat}, ${lng}), ll_to_earth (lat, lng)) < 10000
      ORDER BY
      distance
      `
      res.status(200).json({ data })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  details: async (
    req: expressRequest<any, any, Event, { id: number }> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { id } = req.params
    const parsedId = Number(id)

    try {
      const data = await prisma.event.findUnique({
        where: { id: parsedId },
        include: {
          EventImage: {
            orderBy: {
              id: 'desc'
            }
          },
          author: true,
          Atendee: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      res.status(200).json({ data })
    } catch (err) {
      res.status(400).json(err)
    }
  },
}

export default eventController
