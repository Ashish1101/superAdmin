import {signUp , signin , updateSuperAdmin , deleteSuperAdmin} from '../services/superAdmin'
import express, {Request , Response, Router , Express} from 'express'

import ValidationLayer from '../utils/ValidationLayer'
import verifyToken from '../utils/verifyJwtToken'
import { Channel } from 'amqplib'
const validations = new ValidationLayer()



const superAdminRoutes = ( app : Express  , channel : Channel) => {
    app.post('/signup' , [validations.signup], async (req : Request, res : Response) => {
        try {
            console.log('hello from serivce layer')
            const serviceLayerResponse = await signUp(req.body , channel)
            console.log(serviceLayerResponse)
            return res.status(200).json(serviceLayerResponse);
        } catch (err) {
            console.log('error in response layer signup' , err)
        }
})

app.post('/signin' , [validations.signup], async (req : Request, res : Response) => {
    try {
        console.log('hello from serivce layer')
        const serviceLayerResponse = await signin(req.body , channel)
        console.log(serviceLayerResponse)
        return res.status(200).json(serviceLayerResponse);
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

app.post('/updateSuperAdmin' , [verifyToken], async (req : Request, res : Response) => {
    try {
        const user = (req as any).user
        const userInputs = {
            id : user.id,
            ...req.body
        }
        const serviceLayerResponse = await updateSuperAdmin(userInputs)
        console.log(serviceLayerResponse)
        return res.status(200).json(serviceLayerResponse);
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

app.delete('/deleteSuperAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    try {
        const id = (req as any).user.id
        const serviceLayerResponse = await deleteSuperAdmin({id})
        console.log(serviceLayerResponse);
        return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

//app for adding a admin
app.post('/admin/createAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    //from here we will send the req.body to the admin service and get the acknowledgement
})
}

export default superAdminRoutes


