const axios = require('axios')
const helpers = require('../helpers')
const fs = require("fs");

const HAS_TOKEN = {
  'GRAIN':  '0x99f7f1a1dd30457dfad312b4064fa4ad4b73b2d7', // 0x02838746d9e1413e07ee064fcbada57055417f21
  'ERN':    '0x0d8cd4191b92c1eb373ae7eac3696a00748410f2', // 0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a
  'WFTM':   '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', // 0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83
  'MPX':    '0xdd257d090fa0f9ffb496b790844418593e969ba6', // 0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb
  'OATH':   '0xea67f85a2220bbf9859c25d73685f780c7551a12', // 0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6
  'FRAX':   '0x088be716eca24b143fcc9ed06c6ae9977a469cce', // 0xdc301622e621166bd8e82f2ca0a26c13ad0be355
  'DEUS':   '0x0153bf855fe4c5dd5acaf49c49a4a6625f071d93', // 0xde5ed76e7c05ec5e4572cfc88d1acea165109e44
  'FVM':    '0xae459ee7377fb9f67518047bba5482c2f0963236', // 0x07bb65faac502d4996532f834a1b7ba5dc32ff96
  'LQDR':   '0x3ae658656d1c526144db371faef2fff7170654ee', // 0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9
  'SCREAM': '0x63a03871141d88cb5417f18dd5b782f9c2118b5b', // 0xe0654c8e6fd4d733349ac7e09f6f23da256bf475
  'USDC':   '0xc647ce76ec30033aa319d472ae9f4462068f2ad7', // 0x28a92dde19d9989f39a49905d7c9c2fac7799bdf
  'TAROT':  '0xb0fdcdd7e920a036331abe9ffc7313322c0abba0', // 0xc5e2b037d30a390e62180970b3aa4e91868764cd
  'sFTMX':  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', // 0xd7028092c830b5c8fce061af2e593413ebbc1fc1
  'WETH':   '0xf2610511493473379d76bfee07b673d0cb4ed3e7', // 0x695921034f0387eac4e11620ee91b1b15a6a09fe
  'WBTC':   '0x04636d31be7a53bb91e48166b2458c6c35cc7bf2', // 0xf1648c50d2863f780c57849d812b4b7686031a3d
  'frxETH': '0x9e6f4ea5c799253eca001ac159646c36ae607f41', // 0x9e73f99ee061c8807f69f9c6ccc44ea3d8c373ee
}

const TOKEN_AMOUNTS = {
  'GRAIN-ERN': { q0:600, q1:9.000 }, //{ q0:75.695, q1:1.000 },
  'GRAIN-WFTM': { q0:17.650, q1:1.000 },
  'WFTM-MPX': { q0:1.000, q1:2.868 },
  'OATH-ERN': { q0:20.453, q1:1.000 },
  'WFTM-FRAX': { q0:4.169, q1:1.000 },
  'WFTM-DEUS': { q0:106.190, q1:1.000 },
  'FVM-WFTM': { q0:1.000, q1:1.963 },
  'LQDR-WFTM': { q0:1.000, q1:1.656 },
  'WFTM-SCREAM': { q0:1.940, q1:1.000 },
  'WFTM-USDC': { q0:4.166, q1:1.000 },
  'WFTM-TAROT': { q0:1.000, q1:4.300 },
  'WFTM-sFTMX': { q0:1.088, q1:1.000 },
  'WFTM-WETH': { q0:7775.866, q1:1.000 },
  'WETH-WBTC': { q0:15.998, q1:1.000 },
  'WFTM-frxETH': { q0:7735.483, q1:1.000 },
}

const PATHS_WFTM_to_X = {
  'GRAIN': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x02838746d9e1413e07ee064fcbada57055417f21', stable:false}  // WFTM - GRAIN
  ],
  'ERN': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf', stable:false}, // WFTM -> USDC
    {from:'0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf', to:'0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a', stable:true}, // USDC -> ERN
  ],
  'WFTM': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', stable:false}  // WFTM - WFTM
  ],
  'MPX': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb', stable:false}  // WFTM - MPX
  ],
  'OATH': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6', stable:false}  // WFTM - OATH
  ],
  'FRAX': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xdc301622e621166bd8e82f2ca0a26c13ad0be355', stable:false}  // WFTM - FRAX
  ],
  'DEUS': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xde5ed76e7c05ec5e4572cfc88d1acea165109e44', stable:false}  // WFTM - DEUS
  ],
  'FVM': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x07bb65faac502d4996532f834a1b7ba5dc32ff96', stable:false}  // WFTM - FVM
  ],
  'LQDR': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9', stable:false}  // WFTM - LQDR
  ],
  'SCREAM': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xe0654c8e6fd4d733349ac7e09f6f23da256bf475', stable:false}  // WFTM - SCREAM
  ],
  'USDC': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x28a92dde19d9989f39a49905d7c9c2fac7799bdf', stable:false}  // WFTM - USDC
  ],
  'TAROT': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xc5e2b037d30a390e62180970b3aa4e91868764cd', stable:false}  // WFTM - TAROT
  ],
  'sFTMX': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xd7028092c830b5c8fce061af2e593413ebbc1fc1', stable:false}  // WFTM - sFTMX
  ],
  'WETH': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x695921034f0387eac4e11620ee91b1b15a6a09fe', stable:false}  // WFTM - WETH
  ],
  'WBTC': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0xf1648c50d2863f780c57849d812b4b7686031a3d', stable:false}  // WFTM - WBTC
  ],
  'frxETH': [
    {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'0x9e73f99ee061c8807f69f9c6ccc44ea3d8c373ee', stable:false}  // WFTM - frxETH
  ],
}

const IS_STABLE = [
  'USDC-DEI'
]

const disabled = []

const main = async () => {
  // Load data from FVM:
  // const webdata = await axios.get('https://www.fvm.exchange/api/pairs').then(resp => resp.data)
  // console.log(webdata)

  // Load json and save to file:
  // helpers.saveJsonFile('fvm_pool_info.json', webdata)
  
  // Extract out the info we want from the FVM pools data:
  const webdata = JSON.parse((await helpers.getJsonFile('fvm_pool_info.json', {})).toString())
  // console.log(fvm)

  const data = webdata.data
    .filter(dat => dat.tvl > 25000 && dat.aprs?.[0]?.min_apr||0 > 5)
    .filter(dat => !dat.stable)
    // .sort((a, b) => a.stable ? 1 : -1)
    .map(dat => {
      return {
        symbol: dat.symbol,
        name: dat.symbol.substring(5).replace('/', '-'),
        want: dat.address,
        gauge: dat.gauge_address,
        token0: dat.token0_address,
        token1: dat.token1_address,
        token0_symbol: dat.token0.symbol,
        token1_symbol: dat.token1.symbol,
        stable: dat.stable,
        apr: dat.aprs?.[0]?.min_apr,
        tvl: dat.tvl,
        reserve0: dat.reserve0,
        reserve1: dat.reserve1,
      }
    })
    .sort((a, b) => b.apr - a.apr)
    // .sort((a, b) => a.apr > b.apr ? -1 : 1)
    // .sort((a, b) => a.stable ? 1 : -1)

  console.log(data)
  console.log('count:', data.length)
  
  let arTokens = [];

  //console.log(data.map(dat => ([dat.symbol, dat.apr, dat.tvl])))
  data.forEach(dat => {

    // print out holder struct:
    // [{a:dat.token0, s:dat.token0_symbol}, {a:dat.token1, s:dat.token1_symbol}].forEach(itm => {
    //   if (!arTokens.includes(itm.s)){
    //     console.log(`'${itm.s}': '', // ${itm.a}`)
  
    //     arTokens.push(itm.s)
    //   }
    // })

    // print token amounts:
    // let q0 = q1 = 1;
    // if (dat.reserve0 > dat.reserve1){
    //   q0 = dat.reserve0 / dat.reserve1;
    //   q1 = 1;
    // } else {
    //   q0 = 1;
    //   q1 = dat.reserve1 / dat.reserve0;
    // }
    // console.log(`'${dat.symbol.substring(5).replace('/','-')}': { q0:${q0.toFixed(3)}, q1:${q1.toFixed(3)} },`)

    // print setup for paths:
    // [{a:dat.token0, s:dat.token0_symbol}, {a:dat.token1, s:dat.token1_symbol}].forEach(itm => {
    //   if (!arTokens.includes(itm.s)){
    //     console.log(`'${itm.s}': [\n  {from:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', to:'${itm.a}', stable:false}  // WFTM - ${itm.s}\n],`)
  
    //     arTokens.push(itm.s)
    //   }
    // })


    // if (!Object.hasOwn(arTokens, dat.token0.symbol)){
    //   console.log(`'${dat.token0.symbol}`)
    // }

    // const pairSplit = dat.symbol.split('-')[1].split('/')
    // console.log(pairSplit)
    // if (Object.hasOwn(arTokens, dat.symbol))
    //   arTokens[dat.symbol] = 


    // console.log(`${dat.symbol}, ${dat.apr.toLocaleString()}, ${dat.tvl.toLocaleString()}`)

    
  })

  // return createTests(data)
}


const createTests = async (data) => {
  let template = await fs.promises.readFile('templates/Test.txt')

  // data.forEach(async conf => {
  for await(const conf of data){
    const contract = "FvmStratStd";

    // console.log({...conf, contract})

    // Which token is which:
    let token0 = conf.token0
    let token0name = conf.token0_symbol
    // let token0name = conf.name.split('/')[0]
    // console.log(token0name)
    let token0Qty = TOKEN_AMOUNTS[conf.name].q0
    let token1 = conf.token1
    let token1name = conf.token1_symbol
    // let token1name = conf.name.split('/')[1]
    let token1Qty = TOKEN_AMOUNTS[conf.name].q1

    let token0Path = ''
    let token1Path = ''


    // Generate the text:
    let tmpl = template.toString().replace('$MODULE', './modules/fvmVaultStratBase')
    tmpl = tmpl.replace('$TOKEN_NAME', 'xF-'+conf.name)
    tmpl = tmpl.replace('$CONTRACT', contract)
    tmpl = tmpl.replace('$STRATNAME', 'xF-'+conf.name)

    tmpl = tmpl.replace('$WANT', conf.want)
    tmpl = tmpl.replace('$GAUGE', conf.gauge)

    tmpl = tmpl.replace('$TOKEN0', token0)
    tmpl = tmpl.replace('$TOKEN0_NAME', token0name)
    tmpl = tmpl.replace('$TOKEN0QTY', token0Qty)

    tmpl = tmpl.replace('$TOKEN1', token1)
    tmpl = tmpl.replace('$TOKEN1_NAME', token1name)
    tmpl = tmpl.replace('$TOKEN1QTY', token1Qty)

    tmpl = tmpl.replace('$HASTOKEN0', HAS_TOKEN[token0name])
    tmpl = tmpl.replace('$HASTOKEN1', HAS_TOKEN[token1name])

    tmpl = tmpl.replace('$PATH0TOX', JSON.stringify(PATHS_WFTM_to_X[conf.token0_symbol], undefined, '  '))
    tmpl = tmpl.replace('$PATH1TOX', JSON.stringify(PATHS_WFTM_to_X[conf.token1_symbol], undefined, '  '))

    tmpl = tmpl.replace('$ISSTABLE', IS_STABLE.includes(conf.name))

console.log(tmpl)

    // save test file:
    await fs.promises.writeFile(`test/FvmExchange/test-${conf.name}.js`, tmpl)
  }

  
}

// "token0": {
//   "price": 1,
//   "nativeChainAddress": "",
//   "nativeChainId": 0,
//   "address": "0x28a92dde19d9989f39a49905d7c9c2fac7799bdf",
//   "name": "USDC Coin",
//   "symbol": "USDC",
//   "decimals": 6,
//   "logoURI": "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
// },
// "token1": {
//   "price": 1.0024,
//   "nativeChainAddress": "",
//   "nativeChainId": 0,
//   "address": "0xcc1b99ddac1a33c201a742a1851662e87bc7f22c",
//   "name": "Tether USD",
//   "symbol": "USDT",
//   "decimals": 6,
//   "logoURI": "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg"
// },


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

