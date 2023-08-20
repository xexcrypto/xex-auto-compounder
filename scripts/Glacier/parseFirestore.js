const hre = require("hardhat");
const fs = require("fs");
const readline = require('readline');
const events = require('events');

//const docFilter = ['GLCR/WAVAX', 'GLCR/fBOMB', 'GLCR/spGLCR', 'XEX/WAVAX']
const docFilter = ['GRAPE', 'WINE']
const docFilterExc = ['gmd', 'MMTH', 'DEI']
const APPLY_TVL_APR_FILTER = false

const routers = {
  traderjoe:  '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
  lydia:      '0xA52aBE4676dbfd04Df42eF7755F01A3c41f28D27',
  glacier:    '0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC',
}

const main = async () => {

  // Get docs:
  const docs = await parseRaw()
  console.log(docs.length)
  
  // DEBUG:
  // const doc = JSON.parse(docs[0])
  // console.log(doc)

  let docCount = 0
  const output = []

  // Parse each doc to extract value:
  docs.forEach(docTxt => {
    const docRoot = JSON.parse(docTxt)

    if (!docRoot.documentChange)
      return

    const doc = docRoot.documentChange.document
    const fields = doc.fields

    const name = fields.name.stringValue
    const symbol = fields.symbol.stringValue
    const symbolLow = fields.symbol.stringValue.toLowerCase()
    const pairAddr = fields.address.stringValue
    const gauge = fields.gaugesAddress.stringValue
    const token0 = {
      addr: fields.token0_address.stringValue,
      name: fields.token0.mapValue.fields.name.stringValue,
      symbol: fields.token0.mapValue.fields.symbol.stringValue,
      symbolLow: fields.token0.mapValue.fields.symbol.stringValue.toLowerCase(),
    }
    const token1 = {
      addr: fields.token1_address.stringValue,
      name: fields.token1.mapValue.fields.name.stringValue,
      symbol: fields.token1.mapValue.fields.symbol.stringValue,
      symbolLow: fields.token1.mapValue.fields.symbol.stringValue.toLowerCase(),
    }

    const tvl = parseFloat(fields.tvl.doubleValue||0)
    const apr = parseFloat(fields?.apr?.doubleValue||0)
    const price0 = parseFloat(fields.price0.doubleValue || fields.price0.stringValue || fields.price0.integerValue)
    const price1 = parseFloat(fields.price1.doubleValue || fields.price1.stringValue || fields.price1.integerValue)

    // Filter docs \\
    // Match words:
    let docs = docFilter.reduce((acc, srch) => {
      if (!acc)
        acc = name.includes(srch) || symbol.includes(srch)
      return acc; 
    }, false)
    if (!docs) 
      return

    // Exclude tokens:
    docs = docFilterExc.reduce((acc, srch) => {
      if (!acc)
        acc = name.includes(srch) || symbol.includes(srch)
      return acc; 
    }, false)
    if (docs) 
      return

    // Match values:
    if (APPLY_TVL_APR_FILTER){
      if (tvl < 25000 || apr < 5)
        return
    }

    // console.log(doc.documentChange.document.fields.name.stringValue)
    console.log('--------------------------------------------------------')
    console.log(`${name} (${symbol})`)
    console.log(`  LP ADDR:   ${pairAddr}`)
    console.log(`    GAUGE:   ${gauge}`)
    console.log(`  TOKEN 0:   ${token0.name} (${token0.symbol})`)
    console.log(`             ${token0.addr}`)
    console.log(`  TOKEN 1:   ${token1.name} (${token1.symbol})`)
    console.log(`             ${token1.addr}`)
    console.log(`      tvl:   ${tvl.toLocaleString()}`)
    console.log(`      apr:   ${apr.toLocaleString()}`)
    console.log(`   price0:   ${price0.toLocaleString()}`)
    console.log(`   price1:   ${price1.toLocaleString()}`)
    console.log('')

    // now generate the json for contract generation:
    const isXG = !token0.symbolLow.includes('glcr') && token1.symbolLow.includes('glcr')
    const isGX = token0.symbolLow.includes('glcr') && !token1.symbolLow.includes('glcr')
    const isXX = !token0.symbolLow.includes('glcr') && !token1.symbolLow.includes('glcr')

    const data = {
      name: `${token0.symbol}-${token1.symbol}`,
      contract: isXX ? "StratXX" : isGX ? "StratGlcrX" : "StratXGlcr",
      want: pairAddr,
      gauge: gauge,
      // tokenX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      // path: [
      //   { 
      //     "from":"0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", 
      //     "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", 
      //     "stable": false 
      //   }
      // ]
      price0,
      price1,
    }

    if (isXX){
      data.token0 = token0.addr
      data.token1 = token1.addr
      data.path0toX = PATHS_GLCR_to_X[token0.symbol]
      data.path1toX = PATHS_GLCR_to_X[token1.symbol]
    } else {
      const tokenIdx = isXG ? 0 : 1
      data.tokenX = isXG ? token0.addr : token1.addr
      data.pathToX = PATHS_GLCR_to_X[tokenIdx==0?token0.symbol:token1.symbol]
    }

    output.push(data)

    console.log(data, "\n")

    docCount++
  })

  console.log(JSON.stringify(output, undefined, '  '))

  console.log("\n", `matches: ${docCount}`)

  process.exit(0)
}

// GLCR to Token
const PATHS_GLCR_to_X = {
  "WETH.e": [
    // glcr - wavax
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    // wavax - 
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', stable:false},
    // - weth.e
    {from:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', to:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', stable:false},
  ],
  "USDT.e": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', stable:false},
  ],
  "BTC.b": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x152b9d0FdC40C096757F570A51E494bd4b943E50', stable:false},
  ],
  "WAVAX": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
  ],
  "GRAIN": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x9df4Ac62F9E435DbCD85E06c990a7f0ea32739a9', stable:false},
  ],
  "wMEMO": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b', stable:false},
  ],
  "EUROC": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD', stable:false},
  ],
  "GMX": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x62edc0692BD897D2295872a9FFCac5425011c661', stable:false},
  ],
  "USDC": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', stable:false},
  ],
  "ANKR": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x20CF1b6E9d856321ed4686877CF4538F2C84B4dE', stable:false},
  ],
  "ankrAVAX": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xc3344870d52688874b06d844E0C36cc39FC727F6', stable:false},
  ],
  "ankrETH": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false}, // glcr
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', stable:false}, // WETH.e
    {from:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', to:'0x12D8CE035c5DE3Ce39B1fDD4C1d5a745EAbA3b8C', stable:false}, // ankrETH
  ],
  "DEUS": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', stable:false},
  ],
  "OATH": [
    // glcr - wavax
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    // wavax - usdt.e
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', stable:false},
    // usdt.e - weth.e
    {from:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', to:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', stable:false},
    // weth.e - OATH
    {from:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', to:'0x2c69095d81305F1e3c6ed372336D407231624CEa', stable:false},
  ],
  "xSHRAP": [
    // glcr - wavax
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    // wavax - usdt.e
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', stable:false},
    // usdt.e - weth.e
    {from:'0xc7198437980c041c805A1EDcbA50c1Ce5db95118', to:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', stable:false},
    // weth.e - xSHRAP
    {from:'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', to:'0x1e3c6c53F9f60BF8aAe0D7774C21Fa6b1afddC57', stable:false},
  ],
  "YAK": [
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7', stable:false},
  ],
  "DEI": [
    // glcr - wavax
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
    // wavax - usdc
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', stable:false},
    // usdc - dei
    {from:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', to:'0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0', stable:false},
  ],
  "fBOMB": [
    // glcr - fbomb
    {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce', stable:false},
  ],
  "MIM": [
    // glcr - wavax - Glacier Exchange
    {
      router:routers.glacier,
      paths:[
        // Glacier paths are formatted like this:
        {from:'0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', to:'0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', stable:false},
      ],
      pathsSimple:[]
    },
    // wavax - mim - Trader Joe Exchange
    {
      router:routers.traderjoe,
      paths:[],
      pathsSimple:[
        // trader Joe paths are from and to:
        '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
      ]
    }
  ],
  "GRAPE":[
    // glcr - wavax (glacier)
    // wavax - mim (ThorusFi)
    // mim - grape (Trader Joe)
  ]
}


const parseRaw = async () => {
  let capturing = false
  let buffer = ''
  let captureType = null
  const docs = []

  try {
    // Load data:
    const rl = readline.createInterface({
      input: fs.createReadStream('scripts/glacier/data/firestore-20230730.txt'),
      crlfDelay: Infinity
    });

    // Read lines:
    rl.on('line', (line) => {
      // console.log(`Line from file: ${line}`);

      if (capturing && line.startsWith(']]')){
        // console.log(buffer)
        capturing = false;
        // process.exit(0)
        // return;
        docs.push(buffer)
        buffer = ''
      }

      // Start capturing?
      if (!capturing && line.includes(',[{')){
        capturing = true;
        buffer = '{'
        return

      }
      
      if (capturing){
        if (!captureType){
          if (line.includes('targetChange')){
            capturing = false;
            return;
          }
        }
        buffer += line + "\n"
        return;
      }


    });

    await events.once(rl, 'close');

    return docs

    // console.log(docs.length)

  } catch (err) {
    console.error(err);
  }
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});