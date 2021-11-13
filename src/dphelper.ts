/* eslint-disable no-eval */
import * as fs from 'fs'
import parse = require('csv-parse/lib/sync')
import ObjectsToCsv = require('objects-to-csv')
import { spawn } from 'child_process'

// import ObjectsToCsv from 'objects-to-csv'

// let result = descartes({'aa':['a1','a2'],'bb':['b1','b2'],'cc':['c1','c2']});

// interface InputType {
//   [key: string]: InputType | Array<InputType | string> | null | number
// }

// interface TmpPoint {
//   parent?: string | null
//   count?: number
// }

// const array1 = ['1', '2']
// const array2 = ['a', 'b']
// const array3 = ['@', '*']
// // 作为二维数组来运算
// const array4 = [array1, array2, array3]
// // last为上次运算的结果，current为数组中的当前元素
// const result = array4.reduce((last, current) => {
//   const array = []
//   last.forEach(par1 => {
//     current.forEach(par2 => {
//       array.push()
//     })
//   })
//   return array
// })
// console.log(result)

// // console.log(result);//result就是笛卡尔积
// function descartes (setList: InputType) {
//   // parent上一级索引;count指针计数
//   const point: { [key: string]: TmpPoint } = {}
//   const result = []
//   let pIndex = null
//   let tempCount: number | undefined = 0
//   let obj = {}
//   // 根据参数列生成指针对象
//   for (const key in setList) {
//     if (typeof setList[key] === 'object') {
//       point[key] = {
//         parent: pIndex,
//         count: 0
//       }
//       pIndex = key
//     }
//   }
//   // return single-dimension data
//   if (pIndex === null) {
//     return setList
//   }
//   // Generate descartes dynamically
//   while (true) {
//     for (const index in setList) {
//       tempCount = point[index].count
//       obj[index] = setList[index][tempCount]
//     }
//     result.push(obj)
//     obj = {}
//     while (true) {
//       if (point[index].count + 1 >= setList[index].length) {
//         point[index].count = 0
//         pIndex = point[index].parent
//         if (pIndex === null) {
//           return result
//         }
//         index = pIndex
//       } else {
//         point[index].count++
//         break
//       }
//     }
//   }
// }

type ValidDPType = string | number | boolean

export type SimulationParameter = {
  [key: string]: ValidDPType
}

export type DPRange = {
  key: string
  value: Array<ValidDPType>
}

export interface IDPSet {
  keys: Array<string>
  data: Array<SimulationParameter>
  desProduct: (arg0: DPRange) => IDPSet
}

export class DPSet implements IDPSet {
  keys: Array<string>
  data: Array<SimulationParameter>
  constructor (keys: Array<string>, data: Array<SimulationParameter>) {
    this.keys = keys
    this.data = data
  }

  desProduct (is: DPRange): DPSet {
    if (this.keys.indexOf(is.key) !== -1) return this
    this.keys.push(is.key)
    if (this.data.length <= 0) {
      for (const i in is.value) {
        const newObj: SimulationParameter = {}
        newObj[is.key] = is.value[i]
        this.data.push(newObj)
      }
    } else {
      const newData: Array<SimulationParameter> = []
      for (const i in this.data) {
        const obj = this.data[i]
        for (const j in is.value) {
          const cpObj = { ...obj }
          cpObj[is.key] = is.value[j]
          newData.push(cpObj)
        }
      }
      this.data = newData
    }
    return this
  }
}

function jsonPathTranslate (jPath: string): string {
  if (!(jPath.startsWith('[') && jPath.endsWith(']'))) {
    jPath = jPath
      .split('.')
      .map(x => {
        return `["${x}"]`
      })
      .join('')
  }
  return jPath
}

function setVal (
  _obj: SimulationParameter,
  _key: string,
  _value: ValidDPType
): SimulationParameter {
  const _nKey = jsonPathTranslate(_key)
  if (typeof _value === 'string') {
    eval(`_obj${jsonPathTranslate(_nKey)}='${_value}'`)
  } else {
    eval(`_obj${jsonPathTranslate(_nKey)}=${_value}`)
  }
  return _obj
}

export function generateConfigFiles (
  workspaceDirPath: string,
  templateFilePath: string,
  dpSet: DPSet
): string[] {
  const res: string[] = []
  const templateFileContents = fs.readFileSync(templateFilePath)
  const templateFileJsonObj: SimulationParameter = JSON.parse(
    templateFileContents.toString()
  )
  const fileExtension = templateFilePath.substring(
    templateFilePath.lastIndexOf('.') + 1
  )

  if (!fs.existsSync(workspaceDirPath)) {
    fs.mkdirSync(workspaceDirPath)
  }
  dpSet.data.forEach((e, i) => {
    let outputObj = { ...templateFileJsonObj }
    for (const k in e) {
      outputObj = setVal(outputObj, k, e[k])
    }
    const genFilePath = `${workspaceDirPath}/${i}.${fileExtension}`
    fs.writeFileSync(genFilePath, JSON.stringify(outputObj))
    res.push(genFilePath)
  })
  return res
}

export async function generateDPCSVFiles (
  workspaceDirPath: string,
  templateFilePath: string,
  dpSet: DPSet
): Promise<string[]> {
  const res: string[] = []
  const fileExtension = templateFilePath.substring(
    templateFilePath.lastIndexOf('.') + 1
  )
  const templateFileContents = fs.readFileSync(templateFilePath)
  const templateRecords = parse(templateFileContents, {
    columns: true
  })
  if (!fs.existsSync(workspaceDirPath)) {
    fs.mkdirSync(workspaceDirPath)
  }
  dpSet.data.forEach(async (e, i) => {
    for (let i = 0; i < templateRecords.length; i++) {
      const templateRecord = templateRecords[i]
      const dpn = templateRecord.design_parameter_name
      if (dpn in e) {
        templateRecord.value = e[dpn]
      }
    }
    const csv = new ObjectsToCsv(templateRecords)
    const genFilePath = `${workspaceDirPath}/${i}.${fileExtension}`
    await csv.toDisk(genFilePath)
    res.push(genFilePath)
  })
  return res
}

function generateSimulations (
  exeName: string,
  rootDirectory: string,
  dpFiles: string[],
  ifCof: boolean
) {
  if (ifCof) {
    for (const dpFile in dpFiles) {
      const cmd = `${exeName} --cf_dp_file=${dpFile}`
      const spawnObj = spawn(exeName, [`--cf_dp_file=${dpFile}`], {
        encoding: 'utf-8'
      })
    }
  }
}

// function aggregateData (
//   root_dir_path: string,
//   data_file_path: string,
//   domain: string
// ) {}
