import { Router } from 'express'
import userController from '../controllers/userController'

const userRouter = Router()

userRouter.get('/', userController.index)


export default userRouter
