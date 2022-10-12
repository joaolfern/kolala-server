import { Router } from 'express'
import unauthController from '../controllers/unauthController'

const unauthRouter = Router()

unauthRouter.post('/login', unauthController.login)
unauthRouter.post('/login/token', unauthController.loginWithToken)

export default unauthRouter
