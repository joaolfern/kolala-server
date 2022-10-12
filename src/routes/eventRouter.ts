import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../config/multer'
import eventController from '../controllers/eventController'
import verify from '../middlewares/verify'

const eventRouter = Router()
const upload = multer(multerConfig)

eventRouter.get('/map', verify, eventController.map)
eventRouter.get('/', verify, eventController.index)
eventRouter.post('/', verify, upload.array('image[]', 20), eventController.create)
eventRouter.patch('/:id', verify, upload.array('image[]', 20), eventController.update)
eventRouter.delete('/:id', verify, eventController.delete)
eventRouter.get('/:id', verify, eventController.details)

export default eventRouter
