import { Router } from 'express'
import unauthController from '../controllers/unauthController'

const unauthRouter = Router()

unauthRouter.post('/access-token', unauthController.accessToken)
unauthRouter.post('/login/token', unauthController.loginWithToken)

export default unauthRouter
