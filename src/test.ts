import {
  DPRange,
  DPSet,
  generateConfigFiles,
  generateDPCSVFiles
} from './dphelper'

import { genSimulationsWithDpSet } from './jobhelper'

const configTplFilePath: string = '../extra/stream/stream_core_4c_to_all.json'
const workSpaceFilePath: string = '../extra/stream/gen-streams'
const ijr: DPRange = {
  key: 'streams.0.ops.1.inject_rate',
  value: [0.1, 0.11, 0.12]
}

const genStreamsRes = new DPSet([], [])

genStreamsRes.desProduct(ijr)

const genedFiles = generateConfigFiles(
  workSpaceFilePath,
  configTplFilePath,
  'stream',
  genStreamsRes
)
console.log(genedFiles)

const dp3: DPRange = { key: 'DP_STREAM_FILE', value: genedFiles }
const dpset = new DPSet([], [])
dpset.desProduct(dp3)

const genedDpCSVs = generateDPCSVFiles(
  '../extra/dps/gen',
  '../extra/dps/cofs_dp.csv',
  'cofs_dp_gen',
  dpset
)

console.log(genedDpCSVs)

genedDpCSVs.then(csvs => {
  genSimulationsWithDpSet(
    'maywzh',
    '../extra/run',
    '../extra/bin/sample_compute_die_8x8_top.exe',
    csvs,
    '5us',
    '27000@10.239.44.116'
  )
})

// genedDpCSVs.then(data => {
//   console.log(data)
//   genSimulationsWithDpSet(
//     'maywzh',
//     '../extra/run',
//     '5us',
//     '27000@10.239.44.116',
//     '../extra/bin/sample_compute_die_8x8_top.exe',
//     data
//   )
// })
// genedDpCSVs.then(data => {
//   for (const idx in data) {
//     genSimulation(
//       'maywzh',
//       '../extra/run',
//       '../extra/bin/sample_compute_die_8x8_top.exe',
//       data[idx],
//       new Date().toISOString(),
//       '5us',
//       '27000@10.239.44.116'
//     )
//   }
// })

// const data = genSimulation(
//   'maywzh',
//   '../extra/run',
//   '../extra/bin/sample_compute_die_8x8_top.exe',
//   '../extra/dps/cofs_dp.csv',
//   '123123',
//   '5us',
//   '27000@10.239.44.116'
// )
// data.then(str => {
//   console.log(str)
// })
// const b: DPRange = { key: 'Y', value: ['Y1', 'Y2'] }
// // const c: DPRange = { key: 'Z', value: [1.0, 2.0, 3.0] }
// // const d: DPRange = { key: '["W"]["ops"]', value: [1.1, 1.2, 1.3] }
// const e: DPRange = { key: 'V.arr.1.ip', value: [8, 9] }
// const res = new DPSet([], [])

// const dp1: DPRange = { key: 'DP_EGR_ARB_PHASE', value: [0.04, 0.05, 0.06] }
// const dp2: DPRange = { key: 'DP_IGR_ARB_PHASE', value: [0.03, 0.07, 0.08] }

// res.desProduct(a).desProduct(b)

// const genedFiles = generateConfigFiles(
//   workSpaceFilePath,
//   configTplFilePath,
//   res
// )
// console.log(genedFiles)
// const dp3: DPRange = { key: 'DP_STREAM_FILE', value: genedFiles }

//

// dpset
//   .desProduct(dp1)
//   .desProduct(dp2)
//   .desProduct(dp3)

// const genedDpCSVs = generateDPCSVFiles(
//   '../extra/dps/gen',
//   '../extra/dps/cofs_dp.csv',
//   dpset
// )

// genedDpCSVs.then(str => {
//   console.log(str)
// })

// const data = genSimulation(
//   'maywzh',
//   '../extra/run',
//   '../extra/bin/sample_compute_die_8x8_top.exe',
//   '../extra/dps/cofs_dp.csv'
// )
// data.then(str => {
//   console.log(str)
// })
