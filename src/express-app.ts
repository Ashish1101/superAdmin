import express , {Request , Response , Express} from 'express'
import ApiLayer from './api'
import morgan from 'morgan'
import helmet from 'helmet'
import amqp from 'amqplib'
import QueueConsumers from './queue'

//in here we will setup the rabbitMQ

export default async (app : Express) => {
    app.use(express.json())
    app.use(express.urlencoded({extended : false}))

    app.use(helmet())
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

    //use routes
    amqp.connect('amqp://localhost:5672').then(async (conn) => {
        const channel = await conn.createChannel()
        
        //insert a superAdminQueue first
        await channel.assertQueue('superAdminQueue')
        await channel.assertQueue('createAdmin')
        ApiLayer.superAdminRoutes(app , channel)
        QueueConsumers(channel)
    })
    app.get('/' , async (req : Request, res : Response) => {
        res.status(200).send('hello')
    })
}