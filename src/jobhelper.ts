import { getUserQueue } from './queueworker'
import { Job } from 'bullmq'
import * as fs from 'fs'
import * as path from 'path'

export async function genSimulation (
  queueUserName: string,
  workspacePath: string,
  exePath: string,
  dpCSVPath: string,
  taskName: string,
  simDuration: string,
  license: string
): Promise<Job<any, any, string>> {
  const cmdQueue = getUserQueue(queueUserName).queue
  let cwd = `${workspacePath}/${taskName}`
  if (!fs.existsSync(cwd)) {
    fs.mkdirSync(cwd, { recursive: true })
  }
  cwd = path.resolve(cwd)
  exePath = path.resolve(exePath)
  dpCSVPath = path.resolve(dpCSVPath)
  console.log(dpCSVPath, license, simDuration)
  let args = [
    `${exePath}`,
    `--cf-dp-values-file=${dpCSVPath}`,
    `--cf-lic-location=${license}`,
    `--cf-sim-duration=${simDuration}`
  ]
  const cmd = args[0]
  args = args.slice(1, args.length)
  const data = await cmdQueue.add(taskName, {
    cmd,
    args,
    cwd
  })
  return data
}

export async function genSimulationsWithDpSet (
  queueUserName: string,
  workspacePath: string,
  exePath: string,
  dpCSVFiles: string[],
  simDuration: string,
  license: string
): Promise<any> {
  const res = []
  for (const idx in dpCSVFiles) {
    res.push(
      await genSimulation(
        queueUserName,
        workspacePath,
        exePath,
        dpCSVFiles[idx],
        idx,
        simDuration,
        license
      )
    )
  }
  return res
}
