import { Router } from 'express'
import userController from '../controllers/userController'

const userRouter = Router()

userRouter.get('/', userController.index)
userRouter.get('/profile/:id', userController.profile)
userRouter.post('/promote/:targetId', userController.promote)


export default userRouter
