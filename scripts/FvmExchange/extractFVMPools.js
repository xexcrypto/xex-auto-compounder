const axios = require('axios')
const helpers = require('../helpers')

const main = async () => {
  // Extract out the info we want from the FVM pools data:
  const fvm = JSON.parse((await helpers.getJsonFile('fvm_pool_info.json', {})).toString())
  // console.log(fvm)

  const data = fvm.data
    .filter(dat => dat.tvl > 25000 && dat.aprs?.[0]?.min_apr||0 > 5)
    .filter(dat => !dat.stable)
    // .sort((a, b) => a.stable ? 1 : -1)
    .map(dat => {
      return {
        symbol: dat.symbol,
        name: dat.symbol.substring(5),
        want: dat.address,
        gauge: dat.gauge_address,
        token0: dat.token0_address,
        token1: dat.token1_address,
        stable: dat.stable,
        apr: dat.aprs?.[0]?.min_apr,
        tvl: dat.tvl
      }
    })
    .sort((a, b) => b.apr - a.apr)
    // .sort((a, b) => a.apr > b.apr ? -1 : 1)
    // .sort((a, b) => a.stable ? 1 : -1)

  console.log(data)
  console.log('count:', data.length)

  //console.log(data.map(dat => ([dat.symbol, dat.apr, dat.tvl])))
  data.forEach(dat => {
    console.log(`${dat.symbol}, ${dat.apr.toLocaleString()}, ${dat.tvl.toLocaleString()}`)
  })

  // Load json and save to file:
  // helpers.saveJsonFile('fvm_pool_info.json', data)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

