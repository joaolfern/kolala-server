import { Router } from 'express'
import eventRouter from './eventRouter'
import userRouter from './userRouter'

const authRouter = Router()
authRouter.use('/users', userRouter)
authRouter.use('/events', eventRouter)

export default authRouter
