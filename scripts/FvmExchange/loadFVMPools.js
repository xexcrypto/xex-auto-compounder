const axios = require('axios')
const helpers = require('../helpers')

const main = async () => {
  // Load data from FVM:
  const data = await axios.get('https://www.fvm.exchange/api/pairs').then(resp => resp.data)
  console.log(data)

  // Load json and save to file:
  helpers.saveJsonFile('fvm_pool_info.json', data)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

