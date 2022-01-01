import dotenv from 'dotenv'
import express ,  {Request , Response} from 'express'
import databaseLayer from './database'
import expressApp from './express-app'
import Queue from './queue'

dotenv.config()
const app = express();

//database connection

const startServer = async () => {
   databaseLayer.mongoDbConnection();
   await expressApp(app)
   app.listen(5000 , () => console.log('server is running'))
}

startServer()
