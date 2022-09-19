import { Router } from 'express'
import unauthController from '../controllers/unauthController'

const unauthRouter = Router()

unauthRouter.post('/access-token', unauthController.accessToken)

export default unauthRouter
