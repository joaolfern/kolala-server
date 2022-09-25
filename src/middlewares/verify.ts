import jwt from 'jsonwebtoken'

function extractCookieContent (string: string) {
  const regex = /=(.*)/
  return regex.exec(string)[1]
}

function verify (req, res, next) {
  const [userId, bearerToken] = req.headers?.cookie?.split?.(';')
  const formattedUserId = parseFloat(extractCookieContent(userId))
  const formattedBearerToken = extractCookieContent(bearerToken)

  if (!formattedBearerToken) return res.status(401).json('Access Denied')

  try {
    const verified = jwt.verify(formattedBearerToken, process.env.TOKEN_SECRET)
    req.verified = verified
    req.userId = formattedUserId
  } catch (e) {
    res.status(400).json('Invalid Token')
  }
  next()
}


export default verify
