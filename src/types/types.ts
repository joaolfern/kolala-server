import { Request as expressRequest, Response } from 'express'
import { Socket as IoSocket, Server as IoServer } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export type AuthResponse<T> = Response<T>
export type AuthRequest = { userId: number }

export type Request<body> = expressRequest<any, any, body>
export type BodyRequest<body, query = unknown, params = unknown> = expressRequest<params, any, body, query>

export namespace ChatIo {
  export type Socket = IoSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

  export type Server = IoServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
}
