import jwt from 'jsonwebtoken'
import cookie from 'cookie'

function verify (req, res, next) {
  const reqCookie = req.headers?.cookie
  const { bearerToken } = cookie.parse(reqCookie)

  if (!bearerToken) return res.status(401).json('Access Denied')

  try {
    const { userId } = jwt.verify(bearerToken, process.env.TOKEN_SECRET) as { userId: number }
    req.userId = userId
  } catch (e) {
    res.status(400).json('Invalid Token')
  }
  next()
}


export default verify
