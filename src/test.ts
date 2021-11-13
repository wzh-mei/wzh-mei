import {
  DPRange,
  DPSet,
  generateConfigFiles,
  generateDPCSVFiles
} from './dphelper'

const configTplFilePath: string = '../extra/configs/template.json'
const workSpaceFilePath: string = '../extra/configs/gen'
const a: DPRange = { key: 'X', value: [1, 2] }
const b: DPRange = { key: 'Y', value: ['Y1', 'Y2'] }
// const c: DPRange = { key: 'Z', value: [1.0, 2.0, 3.0] }
// const d: DPRange = { key: '["W"]["ops"]', value: [1.1, 1.2, 1.3] }
const e: DPRange = { key: 'V.arr.1.ip', value: [8, 9] }
const res = new DPSet([], [])

const dp1: DPRange = { key: 'DP_EGR_ARB_PHASE', value: [0.04, 0.05, 0.06] }
const dp2: DPRange = { key: 'DP_IGR_ARB_PHASE', value: [0.03, 0.07, 0.08] }

res.desProduct(a).desProduct(b)

const genedFiles = generateConfigFiles(
  workSpaceFilePath,
  configTplFilePath,
  res
)
console.log(genedFiles)
const dp3: DPRange = { key: 'DP_STREAM_FILE', value: genedFiles }

const dpset = new DPSet([], [])

dpset
  .desProduct(dp1)
  .desProduct(dp2)
  .desProduct(dp3)

const genedDpCSVs = generateDPCSVFiles(
  '../extra/dps/gen',
  '../extra/dps/cofs_dp.csv',
  dpset
)
