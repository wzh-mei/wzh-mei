import * as express from 'express'
import * as multer from 'multer'

import { Request, Response } from 'express'

const router = express.Router()

const apiResponse = (res: Response, status = 200) => (
  data: any,
  success?: boolean,
  errorMsg?: string,
  error?: Error
) => {
  return res.status(status).json(data)
}

const apiError = (res: Response, status = 500) => (
  errorMsg: string,
  error?: Error
) => {
  return res.status(status).json({ errorMsg, error })
}

router.post('/uploadDPCSV', (req: Request, res: Response) => {
  const upload = multer({ dest: 'upload/' }).single('file')
  upload(req, res, err => {
    if (err) {
      return apiError(res)('An error occurred uploading files', err)
    }
    if (!req.files?.length) {
      return apiError(res)('Cannot find any file to upload')
    }
    return apiResponse(res)(true)
  })
})

export { router as ApiRouter }
