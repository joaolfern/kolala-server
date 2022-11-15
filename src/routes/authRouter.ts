import { Router } from 'express'
import { chatRouter } from './chatRouter'
import eventRouter from './eventRouter'
import userRouter from './userRouter'
import reportRouter from './reportRouter'

const authRouter = Router()
authRouter.use('/users', userRouter)
authRouter.use('/events', eventRouter)
authRouter.use('/chat', chatRouter)
authRouter.use('/reports', reportRouter)

export default authRouter
