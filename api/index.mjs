import express from 'express'
import authMiddleware from './middleware/auth.mjs'
import adminRoutes from './routes/admin.mjs'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import {
  readRecords,
  insertRecord,
  deleteRecord,
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  startSession,
  finishSession,
  readSessions,
  deleteUserAccount,
  getStats,
} from './src/utils/records.mjs'

const PORT = 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const app = express()

app.set('trust proxy', 1)

app.use(bodyParser.json())
app.use(cors())
app.use('/api/admin', adminRoutes)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many auth requests, please try again later',
  },
})

const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Слишком много попыток регистрации, попробуйте позднее',
  },
})

const isValidUsername = (username) =>
  /^[a-zA-Z0-9_]{3,30}$/.test(username)

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)

const sanitizeTitle = (title) => {
  const value = String(title || '').trim()

  if (!value) {
    return 'Фокус-сессия'
  }

  return value
}

const isValidSessionTitle = (title) =>
  title.length <= 30

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )

app.get('/', (_, res) => {
  res.send('Time App API is running')
})

app.get('/health', (_, res) => {
  res.send({
    status: 'ok',
    service: 'time-app-api',
  })
})
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).send({
        message: 'Заполните логин, email и пароль',
      })
    }

    if (!isValidUsername(username)) {
  return res.status(400).send({
    message: 'Логин должен быть 3–30 символов и содержать только латиницу, цифры или _',
  })
}

    if (!isValidEmail(email)) {
  return res.status(400).send({
    message: 'Некорректный email',
  })
}

    if (!isValidPassword(password)) {
  return res.status(400).send({
    message: 'Пароль должен быть минимум 8 символов, содержать заглавную букву, строчную букву и цифру',
  })
}

    const existingUser = await findUserByUsername(username)

    if (existingUser) {
  return res.status(409).send({
    message: 'Пользователь с таким логином уже существует',
  })
}

    const existingEmail = await findUserByEmail(email)

    if (existingEmail) {
  return res.status(409).send({
    message: 'Пользователь с таким email уже существует',
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

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send({
        message: 'Введите логин и пароль',
      })
    }

    const user = await findUserByUsername(username)

    if (!user) {
      return res.status(401).send({
        message: 'Неверный логин или пароль',
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).send({
        message: 'Неверный логин или пароль',
      })
    }

    const publicUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
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

app.delete('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await deleteUserAccount(req.user.id)

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'Пользователь не найден',
      })
    }

    return res.status(200).send({
      message: 'Аккаунт и связанные данные удалены',
    })
  } catch (error) {
    console.error('Account deletion error:', error)

    return res.status(500).send({
      message: 'Не удалось удалить аккаунт',
    })
  }
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
  try {
    const title = sanitizeTitle(req.body.title)

    if (!isValidSessionTitle(title)) {
      return res.status(400).send({
        message: 'Название сессии не должно быть длиннее 100 символов',
      })
    }

    res.send(await startSession(title))
  } catch (error) {
    res.status(500).send({
      message: 'Не удалось начать сессию',
    })
  }
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
  try {
    const title = sanitizeTitle(req.body.title)

    if (!isValidSessionTitle(title)) {
      return res.status(400).send({
        message: 'Название сессии не должно быть длиннее 30 символов',
      })
    }

    res.send(await startSession(title, req.user.id))
  } catch (error) {
    res.status(500).send({
      message: 'Не удалось начать сессию',
    })
  }
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