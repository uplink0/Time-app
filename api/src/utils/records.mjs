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

const startSession = (title) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        INSERT INTO focus_sessions 
        (title, started_at, status)
        VALUES (?, NOW(), 'active')
        `,
        [title],
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`Focus session "${title}" was started`)
          resolve({
            id: result.insertId,
            title,
            status: 'active'
          })
        }
      )
    })
  )

const finishSession = (id) =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        UPDATE focus_sessions
        SET
          finished_at = NOW(),
          duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW()),
          status = 'finished'
        WHERE id = ? AND status = 'active'
        `,
        [id],
        (err, result) => {
          connection.release()
          if (err) return reject(err)
          console.log(`Focus session with id ${id} was finished`)
          resolve(result)
        }
      )
    })
  )

const readSessions = () =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT *
        FROM focus_sessions
        ORDER BY created_at DESC
        `,
        (err, results) => {
          connection.release()
          if (err) return reject(err)
          resolve(results)
        }
      )
    })
  )

const getStats = () =>
  new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT
          COUNT(*) AS total_sessions,
          COALESCE(SUM(duration_minutes), 0) AS total_minutes,
          COALESCE(MAX(duration_minutes), 0) AS longest_session
        FROM focus_sessions
        WHERE status = 'finished'
        `,
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
  startSession,
  finishSession,
  readSessions,
  getStats
}