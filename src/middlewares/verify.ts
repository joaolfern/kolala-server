import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export function decryptToken (token: string) {
  return jwt.verify(token, process.env.TOKEN_SECRET) as { userId: number }
}

function verify (req, res, next) {
  const reqCookie = req.headers?.cookie
  const { bearerToken } = cookie.parse(reqCookie || '')

  if (!bearerToken) return res.status(401).json('Access denied!')

  try {
    const { userId } = decryptToken(bearerToken)
    req.userId = userId
  } catch (e) {
    res.status(400).json('Invalid Token')
  }
  next()
}


export default verify
