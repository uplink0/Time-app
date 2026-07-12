import jwt from 'jsonwebtoken'
import { findUserById } from '../src/utils/records.mjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        message: 'Необходима авторизация',
      })
    }

    const token = authHeader.slice(7)
    const payload = jwt.verify(token, JWT_SECRET)

    const user = await findUserById(payload.id)

    if (!user) {
      return res.status(401).send({
        message: 'Пользователь не найден',
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).send({
      message: 'Недействительный или просроченный токен',
    })
  }
}

export default authMiddleware