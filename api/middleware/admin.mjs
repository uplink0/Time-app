const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({
      message: 'Необходима авторизация',
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).send({
      message: 'Недостаточно прав для выполнения операции',
    })
  }

  next()
}

export default adminMiddleware