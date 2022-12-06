import { Event, EventImage } from '@prisma/client'
import { prisma } from '..'
import { AuthRequest, AuthResponse, BodyRequest } from '../types/types'
import { Request as expressRequest } from 'express'
import { ImapFilters } from '../types/events'
import dayjs from 'dayjs'
import eventValidator from '../validations/eventValidator'
import { ifItExists, ifNumberExists } from '../utils/ifItExists'
import yupToFormErrors from '../utils/yupToFormErrors'

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
    lat: ifItExists(lat)(parseFloat),
    lng: ifItExists(lng)(parseFloat),
    category: ifNumberExists(category),
    icon: ifNumberExists(icon),
    datetime: ifItExists(datetime)((props: string) => new Date(props)),
  }
}

const eventController = {
  listOrganizing: async (
    req: BodyRequest<
      any,
      { arePast: string },
      { type: 'organizing' | 'participating' }
    > &
      AuthRequest,
    res
  ) => {
    const { userId, query, params } = req
    const { arePast } = query
    const { type } = params

    const dateFilterKey = arePast === 'true' ? 'lt' : 'gt'
    const datetime = {
      [dateFilterKey]: new Date(),
    }

    const REQUESTS = {
      participating: async () =>
        await prisma.event.findMany({
          where: {
            Atendee: {
              some: {
                userId,
              },
            },
            datetime,
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
            Atendee: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        }),
      organizing: async () =>
        await prisma.event.findMany({
          where: {
            authorId: userId,
            datetime,
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
            Atendee: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        }),
    }

    try {
      const events = await REQUESTS[type]()
      const formattedEvents = events.map(formatEventListItem)

      const data = {
        title: type,
        data: formattedEvents,
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
    const { userId: authorId, files } = req

    const formattedImages = formatEventImageFiles(files)
    const formattedData = parseStringfiedData({
      category,
      lat,
      lng,
      datetime,
      icon,
    })

    const toBeValidatedInput = {
      ...formattedData,
      ...eventRest,
      authorId,
      image: formattedImages,
    }

    try {
      await eventValidator.create
        .validate(toBeValidatedInput, { abortEarly: false })
        .catch(err => {
          const formattedErrors = yupToFormErrors(err)

          res.status(400).json(formattedErrors)
          throw new Error()
        })
    } catch (err) {
      return
    }

    const data = {
      ...eventRest,
      ...formattedData,
      authorId,
      EventImage: {
        createMany: {
          data: formattedImages,
        },
      },
    }

    try {
      await prisma.event.create({ data })

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
    const {
      removedImages = [],
      id: eventId,
      category,
      lat,
      lng,
      status,
      datetime,
      icon,
      ...event
    } = req.body
    const { id } = req.params
    const parsedId = Number(id)
    const { userId, files } = req

    const formattedData = parseStringfiedData({
      category,
      lat,
      lng,
      datetime,
      icon,
    })

    let currentEventImageCount = 0

    try {
      const currentEvent = await prisma.event.findUnique({
        where: {
          id: parsedId,
        },
        include: {
          EventImage: true
        }
      })

      const isUserAuthor = currentEvent.authorId === userId
      if (!isUserAuthor)
        return res.status(400).json({ message: 'Usuário inválido' })

      currentEventImageCount = currentEvent.EventImage.length
      } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }

    const parsedRemovedImages = removedImages.map(id => Number(id))
    const newEventImages = formatEventImageFiles(files)


    const toBeValidatedInput = {
      ...event,
      ...formattedData,
      image: newEventImages,
      removedImages: parsedRemovedImages,
    }

    const removingImagesCount = parsedRemovedImages.length

    try {
      await eventValidator.update({ removingImagesCount, currentEventImageCount })
        .validate(toBeValidatedInput, { abortEarly: false })
        .catch(err => {
          const formattedErrors = yupToFormErrors(err)

          res.status(400).json(formattedErrors)
          throw new Error()
        })
    } catch (err) {
      return
    }

    try {
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
            ...formattedData,
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
  delete: async (
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
    req: expressRequest<any, any, Event, ImapFilters> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { query } = req

    const lat = parseFloat(query.lat)
    const lng = parseFloat(query.lng)
    const distance = parseFloat(query.distance) * 1000
    const minDateRange =
      dayjs(query.minDateRange).isValid() && !!query.minDateRange
        ? dayjs(query.minDateRange).toDate()
        : undefined
    const maxDateRange =
      dayjs(query.maxDateRange).isValid() && !!query.maxDateRange
        ? dayjs(query.maxDateRange).toDate()
        : undefined
    const { datetype } = query

    const queryMinDate = minDateRange || new Date()
    const queryMaxDate =
      maxDateRange ||
      (datetype === 'week'
        ? dayjs().endOf('week').add(1, 'day').toDate()
        : dayjs().endOf('month').toDate())

    try {
      const data = await prisma.$queryRaw`
      SELECT id, icon, lat, lng, title, datetime, address, ROUND(earth_distance(ll_to_earth(${lat}, ${lng}), ll_to_earth(lat, lng))::NUMERIC, 2) AS distance
      FROM
      "Event"
      WHERE
      datetime >= ${queryMinDate}
      AND datetime <= ${queryMaxDate}
      AND earth_box(ll_to_earth (${lat}, ${lng}), ${distance}) @> ll_to_earth (lat, lng)
      AND earth_distance(ll_to_earth (${lat}, ${lng}), ll_to_earth (lat, lng)) < ${distance}
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
          _count: {
            select: {
              Message: true,
            },
          },
          EventImage: {
            orderBy: {
              id: 'desc',
            },
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
  attend: async (
    req: expressRequest<{ id: string }> & AuthRequest,
    res: AuthResponse<any>
  ) => {
    const { userId } = req
    const eventId = Number(req.params.id)

    try {
      const atendeeRecord = await prisma.atendee.findFirst({
        where: {
          eventId,
          userId,
        },
      })

      if (atendeeRecord) {
        await prisma.atendee.delete({
          where: {
            id: atendeeRecord.id,
          },
        })

        res
          .status(200)
          .json({ data: { message: 'Participação delete com sucesso!' } })
      } else {
        await prisma.atendee.create({
          data: {
            userId,
            eventId,
          },
        })
        res
          .status(200)
          .json({ data: { message: 'Participação registrada com sucesso!' } })
      }
    } catch (err) {
      res.status(400).json(err)
    }
  },
}

export default eventController
