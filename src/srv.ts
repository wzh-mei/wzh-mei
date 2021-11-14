import { getUserQueue, bullBoardRouter } from './queueworker'

import * as express from 'express'

const app = express()

const username = 'maywzh'
const maywzhQueue = getUserQueue(username).queue

app.use('/', bullBoardRouter)

app.listen(8089, () => {
  console.log('Server is running on port 8089.')
})
