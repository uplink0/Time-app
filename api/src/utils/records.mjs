import pool from './mysqlPool.mjs'

const readRecords = () =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'SELECT * FROM times ORDER BY created_at DESC',
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results)
        }
      )
    })
  })

const insertRecord = (time) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'INSERT INTO times (time) VALUES (?)',
        [time],
        (queryError, result) => {
          connection.release()

          if (queryError) return reject(queryError)

          console.log(`New time ${time} was saved to the DB`)
          resolve(result)
        }
      )
    })
  })

const deleteRecord = (id) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        'DELETE FROM times WHERE id = ?',
        [id],
        (queryError, result) => {
          connection.release()

          if (queryError) return reject(queryError)

          console.log(`Time with id ${id} was deleted from the DB`)
          resolve(result)
        }
      )
    })
  })

const createUser = ({ username, email, passwordHash }) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        INSERT INTO users
          (username, email, role, password_hash)
        VALUES
          (?, ?, 'user', ?)
        `,
        [username, email, passwordHash],
        (queryError, result) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve({
            id: result.insertId,
            username,
            email,
            role: 'user',
          })
        }
      )
    })
  })

const findUserByUsername = (username) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT
          id,
          username,
          email,
          role,
          password_hash,
          created_at
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username],
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results[0] || null)
        }
      )
    })
  })

const findUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT
          id,
          username,
          email,
          role,
          password_hash,
          created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email],
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results[0] || null)
        }
      )
    })
  })

const findUserById = (id) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT
          id,
          username,
          email,
          role,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id],
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results[0] || null)
        }
      )
    })
  })

const startSession = (title, userId = null) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        INSERT INTO focus_sessions
          (user_id, title, started_at, status)
        VALUES
          (?, ?, NOW(), 'active')
        `,
        [userId, title],
        (queryError, result) => {
          connection.release()

          if (queryError) return reject(queryError)

          console.log(`Focus session "${title}" was started`)

          resolve({
            id: result.insertId,
            user_id: userId,
            title,
            status: 'active',
          })
        }
      )
    })
  })

const finishSession = (id, userId = null) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      const params = userId ? [id, userId] : [id]
      const userFilter = userId ? 'AND user_id = ?' : ''

      connection.query(
        `
        UPDATE focus_sessions
        SET
          finished_at = NOW(),
          duration_minutes = TIMESTAMPDIFF(
            MINUTE,
            started_at,
            NOW()
          ),
          status = 'finished'
        WHERE id = ?
          AND status = 'active'
          ${userFilter}
        `,
        params,
        (queryError, result) => {
          connection.release()

          if (queryError) return reject(queryError)

          console.log(`Focus session with id ${id} was finished`)
          resolve(result)
        }
      )
    })
  })

const readSessions = (userId = null) =>
  new Promise((resolve, reject) => {
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
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results)
        }
      )
    })
  })

const getStats = (userId = null) =>
  new Promise((resolve, reject) => {
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
        (queryError, results) => {
          connection.release()

          if (queryError) return reject(queryError)

          resolve(results[0])
        }
      )
    })
  })

const deleteUserAccount = (userId) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          connection.release()
          return reject(transactionError)
        }

        connection.query(
          'DELETE FROM focus_sessions WHERE user_id = ?',
          [userId],
          (sessionsError) => {
            if (sessionsError) {
              return connection.rollback(() => {
                connection.release()
                reject(sessionsError)
              })
            }

            connection.query(
              'DELETE FROM users WHERE id = ?',
              [userId],
              (userError, result) => {
                if (userError) {
                  return connection.rollback(() => {
                    connection.release()
                    reject(userError)
                  })
                }

                connection.commit((commitError) => {
                  if (commitError) {
                    return connection.rollback(() => {
                      connection.release()
                      reject(commitError)
                    })
                  }

                  connection.release()
                  resolve(result)
                })
              }
            )
          }
        )
      })
    })
  })

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
  getStats,
  deleteUserAccount,
}