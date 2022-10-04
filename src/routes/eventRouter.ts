import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../config/multer'
import eventController from '../controllers/eventController'
import verify from '../middlewares/verify'

const eventRouter = Router()
const upload = multer(multerConfig)

eventRouter.get('/map', verify, eventController.map)
eventRouter.get('/', verify, eventController.index)
eventRouter.post('/', verify, upload.any(), eventController.create)

export default eventRouter
