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
    const { userId: authorId } = req

    const data: Omit<Event, 'status'> = {
      ...eventRest,
      lat: parseFloat(String(lat)),
      lng: parseFloat(String(lng)),
      category: Number(String(category)),
      icon: Number(String(icon)),
      authorId: authorId,
      datetime: new Date(datetime),
    }

    try {
      const createdEvent = await prisma.event.create({
        data,
      })
      const { id: eventId } = createdEvent

      const formattedImages: EventImage[] = Array.isArray(req.files)
        ? (req.files.map((file: any) => {
            return {
              key: file.key || file.filename,
              url:
                file.location ||
                `${process.env.API_URL}/files/${file.key || file.filename}`,
              eventId,
            }
          }) as unknown as EventImage[])
        : ([] as EventImage[])

      await prisma.eventImage.createMany({
        data: formattedImages,
      })

      res.status(200).json('success')
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
          EventImage: true,
          author: true,
          Atendee: {
             orderBy: {
              createdAt: 'asc'
             }
          }
        },
      })

      res.status(200).json({ data })
    } catch (err) {
      res.status(400).json(err)
    }
  },
}

export default eventController
