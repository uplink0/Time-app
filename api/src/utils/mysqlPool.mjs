import mysql from 'mysql2'

const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'mysql',
  port: '3306',
  user: 'root',
  password: 'password',
  database: 'time_db',
})

const CREATE_TIMES_TABLE_SQL = `CREATE TABLE IF NOT EXISTS times (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`

const CREATE_FOCUS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS focus_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  started_at DATETIME NOT NULL,
  finished_at DATETIME NULL,
  duration_minutes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`

pool.getConnection((err, connection) => {
  if (!err) {
    console.log('Connected to the MySQL DB - ID is ' + connection.threadId)

    connection.query(CREATE_TIMES_TABLE_SQL, (err) => {
      if (!err) {
        console.log('Times table was created')
      }
    })

    connection.query(CREATE_FOCUS_TABLE_SQL, (err) => {
      if (!err) {
        console.log('Focus sessions table was created')
      } else {
        console.error(err)
      }
    })

    connection.release()
  }

})

export default pool
