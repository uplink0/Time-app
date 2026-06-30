import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  readRecords,
  insertRecord,
  deleteRecord,
  createUser,
  findUserByUsername,
  findUserById,
  startSession,
  finishSession,
  readSessions,
  getStats,
} from './src/utils/records.mjs'

const PORT = 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const app = express()

app.use(bodyParser.json())
app.use(cors())

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        message: 'Unauthorized',
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET)

    const user = await findUserById(payload.id)

    if (!user) {
      return res.status(401).send({
        message: 'User not found',
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).send({
      message: 'Invalid token',
    })
  }
}

app.get('/', (_, res) => {
  res.send('Time App API is running')
})

app.get('/health', (_, res) => {
  res.send({
    status: 'ok',
    service: 'time-app-api',
  })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).send({
        message: 'Username, email and password are required',
      })
    }

    if (password.length < 6) {
      return res.status(400).send({
        message: 'Password must be at least 6 characters',
      })
    }

    const existingUser = await findUserByUsername(username)

    if (existingUser) {
      return res.status(409).send({
        message: 'User already exists',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await createUser({
      username,
      email,
      passwordHash,
    })

    const token = createToken(user)

    res.status(201).send({
      user,
      token,
    })
  } catch (error) {
    res.status(500).send({
      message: 'Registration failed',
      error: error.message,
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send({
        message: 'Username and password are required',
      })
    }

    const user = await findUserByUsername(username)

    if (!user) {
      return res.status(401).send({
        message: 'Invalid username or password',
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).send({
        message: 'Invalid username or password',
      })
    }

    const publicUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    }

    const token = createToken(publicUser)

    res.send({
      user: publicUser,
      token,
    })
  } catch (error) {
    res.status(500).send({
      message: 'Login failed',
      error: error.message,
    })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.send({
    user: req.user,
  })
})

app.get('/times', async (_, res) => {
  res.send(await readRecords())
})

app.post('/times', async (req, res) => {
  res.send(await insertRecord(req.body.time))
})

app.delete('/time/:id', async (req, res) => {
  res.send(await deleteRecord(req.params.id))
})

app.get('/sessions', async (_, res) => {
  res.send(await readSessions())
})

app.post('/sessions/start', async (req, res) => {
  const title = req.body.title || 'Фокус-сессия'
  res.send(await startSession(title))
})

app.post('/sessions/finish/:id', async (req, res) => {
  res.send(await finishSession(req.params.id))
})

app.get('/stats', async (_, res) => {
  res.send(await getStats())
})

app.get('/api/sessions', authMiddleware, async (req, res) => {
  res.send(await readSessions(req.user.id))
})

app.post('/api/sessions/start', authMiddleware, async (req, res) => {
  const title = req.body.title || 'Фокус-сессия'
  res.send(await startSession(title, req.user.id))
})

app.post('/api/sessions/finish/:id', authMiddleware, async (req, res) => {
  res.send(await finishSession(req.params.id, req.user.id))
})

app.get('/api/stats', authMiddleware, async (req, res) => {
  res.send(await getStats(req.user.id))
})

app.listen(PORT, () => {
  console.log(`Express web server is running at http://localhost:${PORT}`)
})