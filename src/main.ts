import {
  DPRange,
  DPSet,
  SimulationParameter,
  string,
  string[],
  setVal,
  generateConfigFiles
} from './dphelper'

import { exec, spawn } from 'child_process'

const configfile = '../config/test.json'

const a: DPRange = { key: 'X', value: [1, 2, 3] }
const b: DPRange = { key: 'Y', value: ['Y1', 'Y2', 'Y3'] }
const c: DPRange = { key: 'Z', value: [1.0, 2.0, 3.0] }
const res = new DPSet([], [])

res
  .desProduct(a)
  .desProduct(b)
  .desProduct(c)
console.log(res.keys, res.data)
