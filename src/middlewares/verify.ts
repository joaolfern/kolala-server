import jwt from 'jsonwebtoken'

function extractCookieContent (string: string) {
  const regex = /=(.*)/
  return regex.exec(string)[1]
}

function verify (req, res, next) {
  const [bearerToken] = req.headers?.cookie?.split?.(';')
  const formattedBearerToken = extractCookieContent(bearerToken)

  if (!formattedBearerToken) return res.status(401).json('Access Denied')

  try {
    const { userId } = jwt.verify(formattedBearerToken, process.env.TOKEN_SECRET) as { userId: number }
    req.verified = userId
  } catch (e) {
    res.status(400).json('Invalid Token')
  }
  next()
}


export default verify
