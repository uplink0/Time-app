import client from 'prom-client'

const register = new client.Registry()

client.collectDefaultMetrics({
  register,
  prefix: 'time_app_',
})

const httpRequestsTotal = new client.Counter({
  name: 'time_app_http_requests_total',
  help: 'Общее количество HTTP-запросов',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

const httpRequestDurationSeconds = new client.Histogram({
  name: 'time_app_http_request_duration_seconds',
  help: 'Продолжительность HTTP-запросов в секундах',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
})

const registrationsTotal = new client.Counter({
  name: 'time_app_registrations_total',
  help: 'Общее количество успешных регистраций',
  registers: [register],
})

const loginsTotal = new client.Counter({
  name: 'time_app_logins_total',
  help: 'Общее количество успешных входов',
  registers: [register],
})

const focusSessionsStartedTotal = new client.Counter({
  name: 'time_app_focus_sessions_started_total',
  help: 'Общее количество запущенных фокус-сессий',
  registers: [register],
})

const metricsMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationNanoseconds =
      Number(process.hrtime.bigint() - startedAt)

    const durationSeconds = durationNanoseconds / 1_000_000_000

    const route =
      req.route?.path ||
      req.baseUrl ||
      req.path ||
      'unknown'

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }

    httpRequestsTotal.inc(labels)
    httpRequestDurationSeconds.observe(labels, durationSeconds)
  })

  next()
}

export {
  register,
  metricsMiddleware,
  registrationsTotal,
  loginsTotal,
  focusSessionsStartedTotal,
}