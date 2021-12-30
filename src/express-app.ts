import express , {Request , Response , Express} from 'express'
import ApiLayer from './api'
import morgan from 'morgan'
import helmet from 'helmet'

//in here we will setup the rabbitMQ

export default async (app : Express) => {
    app.use(express.json())
    app.use(express.urlencoded({extended : false}))

    app.use(helmet())
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

    //use routes
    app.use('/api' , ApiLayer.superAdminRoutes)  
    app.get('/' , async (req : Request, res : Response) => {
        res.status(200).send('hello')
    })
}