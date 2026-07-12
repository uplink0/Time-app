import express from 'express'
import authMiddleware from '../middleware/auth.mjs'
import adminMiddleware from '../middleware/admin.mjs'
import {
  getUsers,
  deleteUserByAdmin,
} from '../services/adminService.mjs'

const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/users', async (_, res) => {
  try {
    const users = await getUsers()
    res.send(users)
  } catch (error) {
    console.error('Admin users list error:', error)

    res.status(500).send({
      message: 'Не удалось получить список пользователей',
    })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id)

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).send({
        message: 'Некорректный идентификатор пользователя',
      })
    }

    if (userId === req.user.id) {
      return res.status(400).send({
        message: 'Администратор не может удалить собственный аккаунт через панель',
      })
    }

    const result = await deleteUserByAdmin(userId)

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'Пользователь не найден',
      })
    }

    res.send({
      message: 'Пользователь и его сессии удалены',
    })
  } catch (error) {
    console.error('Admin user deletion error:', error)

    res.status(500).send({
      message: 'Не удалось удалить пользователя',
    })
  }
})

export default router