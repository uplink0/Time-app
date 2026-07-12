import mysql from 'mysql2'

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.MYSQL_HOST || 'mysql',
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'time_db',
})

const CREATE_TIMES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS times (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`

const CREATE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`

const CREATE_FOCUS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS focus_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(255) NOT NULL,
  started_at DATETIME NOT NULL,
  finished_at DATETIME NULL,
  duration_minutes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`

const ADD_USER_ID_TO_FOCUS_SQL = `
ALTER TABLE focus_sessions
ADD COLUMN user_id INT NULL
`

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err)
    return
  }

  console.log('Connected to the MySQL DB - ID is ' + connection.threadId)

  connection.query(CREATE_TIMES_TABLE_SQL, (err) => {
    if (!err) {
      console.log('Times table was created')
    } else {
      console.error(err)
    }
  })

  connection.query(CREATE_USERS_TABLE_SQL, (err) => {
    if (!err) {
      console.log('Users table was created')
    } else {
      console.error(err)
    }
  })

  connection.query(CREATE_FOCUS_TABLE_SQL, (err) => {
    if (!err) {
      console.log('Focus sessions table was created')
    } else {
      console.error(err)
    }
  })

  connection.query(ADD_USER_ID_TO_FOCUS_SQL, (err) => {
    if (!err) {
      console.log('user_id column was added to focus_sessions')
      return
    }

    if (
      err.code === 'ER_DUP_FIELDNAME' ||
      err.message.includes('Duplicate column')
    ) {
      console.log('user_id column already exists')
      return
    }

    console.error(err)
  })

  connection.release()
})

export default pool