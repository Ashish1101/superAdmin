import {signUp , signIn , updateSuperAdmin , deleteSuperAdmin , createAdmin, activateAdmin , deActivateAdmin , bulkStudentUpload} from '../services/superAdmin'
import express, {Request , Response, Router , Express, NextFunction} from 'express'

import ValidationLayer from '../utils/ValidationLayer'
import verifyToken from '../utils/verifyJwtToken'
import { Channel } from 'amqplib'
import upload from '../utils/fileUpload'
import formidable from 'formidable'

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
app.post('/signin' , [validations.signin] , async (req : Request, res : Response) => {
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
app.delete('/deleteSuperAdmin' , [verifyToken , validations.deleteSuperAdmin] , async (req : Request , res : Response) => {
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
app.post('/createAdmin' , [verifyToken , validations.createAdmin] , async (req : Request , res : Response) => {
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
app.post('/activateAdmin' , [verifyToken , validations.activateAdmin] , async (req : Request , res : Response) => {
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
app.post('/deActivateAdmin' , [verifyToken , validations.deActivateAdmin] , async (req : Request , res : Response) => {
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


//will do work on it
//getting error in uploading file
app.post('/uploadBulkStudent' , [verifyToken , upload.single('uploadFile')] ,  async ( req : Request , res : Response , next: NextFunction)  => {
    try {
        if(req.file === undefined || req.file === null) {
            return res.status(301).json({message: "File type not supported"})
        }

        //here we will get admin email to send student data

        //we have to write a cron job to delete the file at the end of the day
        const {email} = req.body
        const file = req.file
        console.log('req file ', req.file , email)
        const serviceLayerResponse = await bulkStudentUpload({email , file}, channel)
        console.log('serivce layer')
        return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error from uploadBulkStudent' , err)
    }
})
}

export default superAdminRoutes


