import { Event, User } from '@prisma/client'
import { client } from '..'
import { AuthResponse, Request } from '../types/types'
import { getGoogleUser } from '../services/googleUser'
import { IGoogleUser } from '../types/auth'

function login (user: User) {
  console.log(user)
}

async function createUser (googleUser: IGoogleUser) {
  const user = client.user.create({
    data: {
      authKey: googleUser.sub,
      authMethod: 'google',
      email: googleUser.email,
      profile: {
        create: {
          name: googleUser.given_name,
          picture: googleUser.picture
        }
      }
    }
  })

  return user
}

const unauthController = {
  accessToken: async (
    req: Request<{ accessToken: string }>,
    res: AuthResponse<any>
  ) => {
    const { accessToken } = req.body

    const googleUser = await getGoogleUser(accessToken)

    try {
      const systemUser = await client.user.findUnique({ where: {
        email: googleUser.email
      }})

      if (systemUser) {
        const userAuth = login(systemUser)
        res.send(userAuth)
        return
      }

      const createdUser = await createUser(googleUser)
      const userAuth = login(createdUser)
      res.send(userAuth)
      return
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }

  },
}

export default unauthController
