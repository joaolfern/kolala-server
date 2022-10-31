import dayjs from 'dayjs'
import { NextFunction, Request } from 'express'
import colors from 'colors'

export const terminalMiddleware = (request: Request, _, next: NextFunction) => {
  const method = colors.dim(request.method.trim())
  const requester = colors.blue(request.ip)
  const path = colors.cyan(request.url)
  const timer = colors.white(dayjs().format('HH:mm') || '')

  if (path.includes('socket.io')) return

  console.info(`${timer} ${requester} ${method} ${path}`)
  if (Object.keys(request.body).length) console.info(request.body)
  if (Object.keys(request.query).length) console.info(request.query)
  if (Object.keys(request.params).length) console.info(request.params)

  return next()
}
