import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {
  readRecords,
  insertRecord,
  deleteRecord,
  startSession,
  finishSession,
  readSessions,
  getStats,
} from './src/utils/records.mjs'

const PORT = 5000

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (_, res) => {
  res.send('Time App API is running')
})

app.get('/health', (_, res) => {
  res.send({
    status: 'ok',
    service: 'time-app-api'
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

app.get('/api/sessions', async (_, res) => {
  res.send(await readSessions())
})

app.post('/api/sessions/start', async (req, res) => {
  const title = req.body.title || 'Фокус-сессия'
  res.send(await startSession(title))
})

app.post('/api/sessions/finish/:id', async (req, res) => {
  res.send(await finishSession(req.params.id))
})

app.get('/api/stats', async (_, res) => {
  res.send(await getStats())
})

app.listen(PORT, () => {
  console.log(`Express web server is running at http://localhost:${PORT}`)
})