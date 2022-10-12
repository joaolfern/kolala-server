import { Profile, User } from '@prisma/client'
import { prisma } from '..'
import { AuthResponse, Request } from '../types/types'
import { getGoogleUser } from '../services/googleUser'
import { IGoogleUser } from '../types/auth'
import jwt from 'jsonwebtoken'

function makeToken(user: User) {
  const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET)

  return token
}

async function createUser(googleUser: IGoogleUser) {
  const user = await prisma.user.create({
    data: {
      authKey: googleUser.sub,
      authMethod: 'google',
      email: googleUser.email,
      profile: {
        create: {
          name: googleUser.given_name,
          picture: googleUser.picture,
        },
      },
    },
  })

  return user
}

const unauthController = {
  login: async (
    req: Request<{ accessToken: string }>,
    res: AuthResponse<{ data: { token: string; user: User & { profile: Profile }  } }>
  ) => {
    const { accessToken } = req.body
    const googleUser = await getGoogleUser(accessToken)

    try {
      const systemUser = await prisma.user.findUnique({
        where: {
          email: googleUser.email,
        },
      })

      const account = systemUser || (await createUser(googleUser))
      const profile = await prisma.profile.findFirst({
        where: { id: account.id },
      })
      const token = makeToken(account)

      res.cookie('bearerToken', token)

      const user = {...account, profile}
      res.status(200).send({
        data: {
          user,
          token,
        },
      })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  },
  loginWithToken: async (req: Request<{ token: string }>, res) => {
    const { token } = req.body

    try {
      const { userId } = jwt.verify(token, process.env.TOKEN_SECRET) as {
        userId: number
      }
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          profile: true
        }
      })

      res.cookie('bearerToken', token)

      res.status(200).send({
        data: {
          user
        },
      })
    } catch (err) {
      res.status(400).json('Invalid Token')
    }
  },
}

export default unauthController
