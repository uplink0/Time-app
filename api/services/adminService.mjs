import pool from '../src/utils/mysqlPool.mjs'

const getUsers = () =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.query(
        `
        SELECT
          users.id,
          users.username,
          users.email,
          users.role,
          users.created_at,
          COUNT(focus_sessions.id) AS sessions_count
        FROM users
        LEFT JOIN focus_sessions
          ON focus_sessions.user_id = users.id
        GROUP BY
          users.id,
          users.username,
          users.email,
          users.role,
          users.created_at
        ORDER BY users.created_at DESC
        `,
        (err, results) => {
          connection.release()

          if (err) return reject(err)

          resolve(results)
        }
      )
    })
  })

const deleteUserByAdmin = (userId) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err)

      connection.beginTransaction((err) => {
        if (err) {
          connection.release()
          return reject(err)
        }

        connection.query(
          'DELETE FROM focus_sessions WHERE user_id = ?',
          [userId],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release()
                reject(err)
              })
            }

            connection.query(
              'DELETE FROM users WHERE id = ?',
              [userId],
              (err, result) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release()
                    reject(err)
                  })
                }

                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release()
                      reject(err)
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
  getUsers,
  deleteUserByAdmin,
}