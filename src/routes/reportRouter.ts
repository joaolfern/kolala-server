import { Router } from 'express'
import reportController from '../controllers/reportController'

const eventRouter = Router()

eventRouter.get('/', reportController.list)
eventRouter.post('/', reportController.create)
eventRouter.patch('/:id', reportController.update)

export default eventRouter