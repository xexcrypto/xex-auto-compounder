const fs = require("fs");


module.exports.getJsonFile = async (name, defaultValue) => {
  try {
    // try to read file
    const value = await fs.promises.readFile(name)
    return value == '' ? '{}' : value
  } catch (error) {
    // create empty file, because it wasn't found
    await fs.promises.writeFile(name, defaultValue || '')
    return defaultValue
  }
}

module.exports.saveJsonFile = async (name, value) => {
  const string = JSON.stringify(value, undefined, '  ')
  return await fs.promises.writeFile(name, string)
}