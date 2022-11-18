import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../config/multer'
import userController from '../controllers/userController'

const userRouter = Router()
const upload = multer(multerConfig)

userRouter.get('/', userController.index)
userRouter.get('/profile/:id', userController.findProfile)
userRouter.patch('/profile/:id', upload.single('picture'), userController.updateProfile)
userRouter.post('/promote/:targetId', userController.promote)
userRouter.patch('/status/:targetId', userController.updateStatus)

export default userRouter
