/* eslint-disable no-eval */
import * as fs from 'fs'
import * as path from 'path'
import parse = require('csv-parse/lib/sync')
import ObjectsToCsv = require('objects-to-csv')

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
  genTemplateName: string,
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

  if (fs.existsSync(workspaceDirPath)) {
    fs.rmdirSync(workspaceDirPath, { recursive: true })
    fs.mkdirSync(workspaceDirPath, { recursive: true })
  }
  dpSet.data.forEach((e, i) => {
    let outputObj = { ...templateFileJsonObj }
    for (const k in e) {
      outputObj = setVal(outputObj, k, e[k])
    }
    const genFilePath = `${workspaceDirPath}/${genTemplateName}${i}.${fileExtension}`
    fs.writeFileSync(genFilePath, JSON.stringify(outputObj))
    res.push(path.resolve(genFilePath))
  })
  return res
}

export async function generateDPCSVFiles (
  workspaceDirPath: string,
  templateFilePath: string,
  genTemplateName: string,
  dpSets: DPSet
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
    // fs.rmdirSync(workspaceDirPath, { recursive: true })
    fs.mkdirSync(workspaceDirPath, { recursive: true })
  }
  dpSets.data.forEach(async (dpSet, i) => {
    for (let i = 0; i < templateRecords.length; i++) {
      const templateRecord = templateRecords[i]
      const dpn = templateRecord.design_parameter_name
      if (dpn in dpSet) {
        templateRecord.value = dpSet[dpn]
      }
    }
    const csv = new ObjectsToCsv(templateRecords)
    const genFilePath = `${workspaceDirPath}/${genTemplateName}${i}.${fileExtension}`
    res.push(path.resolve(genFilePath))
    await csv.toDisk(genFilePath)
  })
  return res
}
