import {signUp , signIn , updateSuperAdmin , deleteSuperAdmin , createAdmin, activateAdmin , deActivateAdmin} from '../services/superAdmin'
import express, {Request , Response, Router , Express} from 'express'

import ValidationLayer from '../utils/ValidationLayer'
import verifyToken from '../utils/verifyJwtToken'
import { Channel } from 'amqplib'
const validations = new ValidationLayer()


//ROUTE FOR SIGNUP ANDADMIN
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

//ROUTE FOR SIGNIN AN ADMIN
app.post('/signin' , [validations.signin], async (req : Request, res : Response) => {
    try {
        console.log('hello from serivce layer')
        const serviceLayerResponse = await signIn(req.body , channel)
        console.log(serviceLayerResponse)
        return res.status(200).json(serviceLayerResponse);
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

//ROUTE FOR UPDATING AN ADMIN
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

//ROUTE FOR DELETING AN SUPERADMIN
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

//ROUTE FOR CREATING AN ADMIN
app.post('/createAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    //from here we will send the req.body to the admin service and get the acknowledgement
    try {
    const id = (req as any).user.id
    const {email , password , name , instituteName , mobileNumber} = req.body
    const serviceLayerResponse = await createAdmin({email , password , name , instituteName , mobileNumber , id} , channel)
    console.log(serviceLayerResponse);
    return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error in response layere createAdmin' , err)
    }
})

//ROUTE FOR ACTIVATING AN ADMIN
app.post('/activateAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    //from here we will send the req.body to the admin service and get the acknowledgement
    try {
    const id = (req as any).user.id
    const {email , isActive} = req.body
    const serviceLayerResponse = await activateAdmin({email , isActive, id} , channel)
    console.log(serviceLayerResponse);
    return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error in response layere createAdmin' , err)
    }
})

//ROUTE FOR DEACTIVATING AN ADMIN
app.post('/deActivateAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    //from here we will send the req.body to the admin service and get the acknowledgement
    try {
    const id = (req as any).user.id
    const {email , isActive} = req.body
    const serviceLayerResponse = await deActivateAdmin({email , isActive, id} , channel)
    console.log(serviceLayerResponse);
    return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error in response layere createAdmin' , err)
    }
})
}

export default superAdminRoutes


