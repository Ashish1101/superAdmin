import joi from 'joi'
import {Response , Request , NextFunction} from 'express'

type AuthType = {
    email :string
    password : string
}

type CreateAdminType = {
    email : string
    password : string
    name : string
    mobileNumber : string
    instituteName : string
}

type ActivateAdminType = {
    email : string
    isActive : boolean
}

export default class ValidationLayer {
    signup(req : Request, res : Response, next : NextFunction) {
        const {email , password} : AuthType = req.body
        const check = joi.object({
            email : joi.string().not().empty().email().required(),
            password: joi.string().not().empty().min(8).max(16).required()
        })

        const {error} = check.validate({email , password })
        if(error) {
            return res.status(400).json({message : error.details[0].message})
        }
        next();
    }

    signin(req : Request , res : Response , next : NextFunction) {
        const userInputs : AuthType = (req as any).body
        const {email , password } = userInputs
        const check = joi.object({
            email : joi.string().not().empty().email().required(),
            password : joi.string().not().empty().min(8).max(16).required()
        })
        const {error} = check.validate({email , password});
        if(error) {
            return res.status(400).json({message : error.details[0].message});
        }
        next();
    }

    deleteSuperAdmin(req : Request , res : Response , next : NextFunction) {
        const { id }  = req.body
        const check = joi.object({
            id : joi.string().not().empty().required()
        })

        const {error} = check.validate({id})
        if(error) {
            return res.status(400).json({message : error.details[0].message})
        }
    }

    createAdmin(req : Request , res : Response , next : NextFunction) {
        const {email , password , name , instituteName , mobileNumber} : CreateAdminType = req.body
        const check = joi.object({
            name : joi.string().not().empty().required(),
            password : joi.string().not().empty().min(8).max(16).required(),
            instituteName: joi.string().not().empty().required(),
            mobileNumber : joi.number().not().empty().custom((value , helper) => {
                const str = value.toString()
                if(str.length === 10) {
                    return true
                }
                return helper.error("Invalid mobile number.")
            }),
            email : joi.string().not().empty().email().required()
        })

        const {error} = check.validate({name , email, password , instituteName , mobileNumber});
        if(error) {
            return res.status(400).json({message : error.details[0].message})
        }
        next()
    }

    activateAdmin(req : Request , res : Response , next : NextFunction) {
          const {email , isActive}  : ActivateAdminType = req.body
          const check = joi.object({
              email : joi.string().not().empty().email().required(),
              isActive : joi.boolean().required()
          })

          const {error} = check.validate({email , isActive})
          if(error) {
              return res.status(400).json({message : error.details[0].message})
          }
          next()
    }

    deActivateAdmin(req : Request , res : Response , next : NextFunction) {
        const {email , isActive}  : ActivateAdminType = req.body
        const check = joi.object({
            email : joi.string().not().empty().email().required(),
            isActive : joi.boolean().required()
        })

        const {error} = check.validate({email , isActive})
        if(error) {
            return res.status(400).json({message : error.details[0].message})
        }
        next()
  }
}