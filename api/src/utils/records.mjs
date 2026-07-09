import pool from './mysqlPool.mjs'

const readRecords = () =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'SELECT * FROM `times` ORDER BY created_at DESC',
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results)
        }
      )
    })
  )

const insertRecord = (time) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'INSERT INTO times (time) VALUES (?)',
        [time],
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`New time ${time} was saved to the DB`)
          resolve(result)
        }
      )
    })
  )

const deleteRecord = (id) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'DELETE FROM times WHERE id = ?',
        [id],
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`Time with id ${id} was deleted from the DB`)
          resolve(result)
        }
      )
    })
  )

const createUser = ({ username, email, passwordHash }) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        INSERT INTO users
        (username, email, password_hash)
        VALUES (?, ?, ?)
        `,
        [username, email, passwordHash],
        (err, result) => {
          connection.release()
          if (err) return reject(err)

          resolve({
            id: result.insertId,
            username,
            email
          })
        }
      )
    })
  )

const findUserByUsername = (username) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username],
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results[0] || null)
        }
      )
    })
  )

const findUserByEmail = (email) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email],
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results[0] || null)
        }
      )
    })
  )  

const findUserById = (id) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT id, username, email, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id],
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results[0] || null)
        }
      )
    })
  )

const startSession = (title, userId = null) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        INSERT INTO focus_sessions
        (user_id, title, started_at, status)
        VALUES (?, ?, NOW(), 'active')
        `,
        [userId, title],
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`Focus session "${title}" was started`)

          resolve({
            id: result.insertId,
            user_id: userId,
            title,
            status: 'active'
          })
        }
      )
    })
  )

const finishSession = (id, userId = null) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      const params = userId ? [id, userId] : [id]
      const userFilter = userId ? 'AND user_id = ?' : ''

      connection.query(
        `
        UPDATE focus_sessions
        SET
          finished_at = NOW(),
          duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW()),
          status = 'finished'
        WHERE id = ? AND status = 'active'
        ${userFilter}
        `,
        params,
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`Focus session with id ${id} was finished`)
          resolve(result)
        }
      )
    })
  )

const readSessions = (userId = null) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      const params = userId ? [userId] : []
      const userFilter = userId ? 'WHERE user_id = ?' : ''

      connection.query(
        `
        SELECT *
        FROM focus_sessions
        ${userFilter}
        ORDER BY created_at DESC
        `,
        params,
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results)
        }
      )
    })
  )

const getStats = (userId = null) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      const params = userId ? [userId] : []
      const userFilter = userId ? 'AND user_id = ?' : ''

      connection.query(
        `
        SELECT
          COUNT(*) AS total_sessions,
          COALESCE(SUM(duration_minutes), 0) AS total_minutes,
          COALESCE(MAX(duration_minutes), 0) AS longest_session
        FROM focus_sessions
        WHERE status = 'finished'
        ${userFilter}
        `,
        params,
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results[0])
        }
      )
    })
  )

export {
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
  getStats
}