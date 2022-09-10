import { Router } from 'express'
import eventController from '../controllers/eventController'

const eventRouter = Router()

eventRouter.get('/', eventController.index)
eventRouter.post('/', eventController.create)

export default eventRouter
