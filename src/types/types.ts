import { Request as expressRequest, Response } from 'express'

export type AuthResponse<T> = Response<T>
export type AuthRequest = { userId: number }

export type Request<body> = expressRequest<any, any, body>
export type BodyRequest<body, query = unknown, params = unknown> = expressRequest<params, any, body, query>