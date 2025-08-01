const { enums } = require('~/consts/validation')

const getLanguages = async (req, res) => {
  res.json({ languages: enums.SPOKEN_LANG_ENUM })
}

module.exports = {
  getLanguages
}
