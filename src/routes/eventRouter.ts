import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../config/multer'
import eventController from '../controllers/eventController'

const eventRouter = Router()
const upload = multer(multerConfig)

eventRouter.get('/map', eventController.map)
eventRouter.get('/', eventController.index)
eventRouter.post('/', upload.array('image[]', 20), eventController.create)
eventRouter.patch('/:id', upload.array('image[]', 20), eventController.update)
eventRouter.delete('/:id', eventController.delete)
eventRouter.get('/:id', eventController.details)
eventRouter.post('/:id/attend', eventController.attend)

export default eventRouter
