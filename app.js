import express from 'express'
import cors from 'cors'
import router from './views/router.js'
import logger from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
// ! Order is important for these
app.use(express.json())
app.use(cors())
app.use(logger)
app.use('/api', router)
app.use(errorHandler)
export default app