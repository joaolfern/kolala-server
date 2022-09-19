import { Request as expressRequest, Response } from 'express'

export type AuthResponse<T> = Response<T>

export type Request<body> = expressRequest<any, any, body>