const userService = require('~/services/user')
const { createForbiddenError } = require('~/utils/errorsHelper')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { id } = req.params
  const { role } = req.query

  const user = await userService.getUserById(id, role)

  res.status(200).json(user)
}

const updateUser = async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).send('No file uploaded.')
  }

  const { originalname, mimetype, size, path, filename } = file

  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimetype)) {
    return res.status(400).send('Only PNG/JPEG files are allowed.')
  }

  if (size > 10 * 1024 * 1024) {
    return res.status(400).send('File is too large.')
  }

  const avatar = {
    url: path,
    public_id: filename,
    mimetype,
    size
  }

  const { id } = req.params
  const { role } = req.user
  const updateData = req.body

  if (id !== req.user.id) throw createForbiddenError()

  await userService.updateUser(id, role, updateData, avatar)

  return res.status(200).json({ message: `File ${originalname} uploaded successfully!`, avatar })
}

const updateStatus = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await userService.updateStatus(id, updateData)

  res.status(204).end()
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateStatus
}
