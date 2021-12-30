import joi from 'joi'
import {Response , Request , NextFunction} from 'express'

type AuthType = {
    email :string
    password : string
}

export default class ValidationLayer {
    signup(req : Request, res : Response, next : NextFunction) {
        const userInputs : AuthType = req.body
        const {email , password} = userInputs
        const check = joi.object({
            email : joi.string().not().empty().email().required(),
            password: joi.string().not().empty().min(8).max(16).required()
        })

        const {error} = check.validate({email , password })
        if(error) {
            return res.status(400).json({message : error.details[0].message})
        }
        next()
    }
}