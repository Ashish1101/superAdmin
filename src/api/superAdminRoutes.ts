import {signUp , signin , updateSuperAdmin , deleteSuperAdmin} from '../services/superAdmin'
import express, {Request , Response, Router} from 'express'
const routes = express.Router();
import ValidationLayer from '../utils/ValidationLayer'
import verifyToken from '../utils/verifyJwtToken'
const validations = new ValidationLayer()

routes.post('/signup' , [validations.signup], async (req : Request, res : Response) => {
        try {
            console.log('hello from serivce layer')
            const serviceLayerResponse = await signUp(req.body)
            console.log(serviceLayerResponse)
            return res.status(200).json(serviceLayerResponse);
        } catch (err) {
            console.log('error in response layer signup' , err)
        }
})

routes.post('/signin' , [validations.signup], async (req : Request, res : Response) => {
    try {
        console.log('hello from serivce layer')
        const serviceLayerResponse = await signin(req.body)
        console.log(serviceLayerResponse)
        return res.status(200).json(serviceLayerResponse);
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

routes.post('/updateSuperAdmin' , [verifyToken], async (req : Request, res : Response) => {
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

routes.delete('/deleteSuperAdmin' , [verifyToken] , async (req : Request , res : Response) => {
    try {
        const id = (req as any).user.id
        const serviceLayerResponse = await deleteSuperAdmin({id})
        console.log(serviceLayerResponse);
        return res.status(200).json(serviceLayerResponse)
    } catch (err) {
        console.log('error in response layer signup' , err)
    }
})

export default routes



