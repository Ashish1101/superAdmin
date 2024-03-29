//this file will contain all the controller related to superAdmin
import databaseLayer from '../database'
const superAdminModel = databaseLayer.superAdminModel
const repository = databaseLayer.repository
import {SUPER_ADMIN_EXCHANGE , CREATE_ADMIN_KEY, ACTIVATE_ADMIN_KEY, DEACTIVATE_ADMIN_KEY} from '../queue/types'
import {HashPassword , comparePassword} from '../utils/passwordHash'
import generateToken from '../utils/generateJwtToken'
import { Channel } from 'amqplib'


type AuthType = {
    email: string
    password: string,
    role? : string
}

type ReturnType = {
    message?: string,
    data?: object
} 

type SuperAdminType = {
    email?: string
    password?:string
    isActive?:boolean
    name?:string
    mobileNumber?:number
    id : string
}

type AdminType = {
    email : string
    password : string
    name?: string
    mobileNumber: number
    instituteName?: string
    id : string //superAdmin id
}

type DeleteSuperAdminType = {
    id : string
}

type ActivateAdmin = {
    email : string
    isActive : boolean
    id : string
}


export const signUp = async (userInputs : AuthType , channel : Channel) : Promise<ReturnType | undefined> => {
    const {email , password} = userInputs
    try {
        let superAdmin = await superAdminModel.findOne({email:email});
        if(superAdmin) {
            // throw new Error('SuperAdmin already exists with this email')
            return {message : "SuperAdmin already exists with this email"}
        }
        superAdmin = await superAdminModel.create({
            email : email,
            password: password,
            role : 'superAdmin'
        })
         
        //testing of queue
        channel.sendToQueue('superAdminQueue' , Buffer.from(JSON.stringify(superAdmin)))

        //hash the password
        let hashedPass = await HashPassword(password)
        superAdmin.password = hashedPass
        //save super admin in database
        await superAdmin.save();
        return {
            message: "SuperAdmin Created.",
            data : superAdmin
        }
    } catch (err) {
        console.log('error in superAdmin signup',err)
    }
}

export const signIn = async (userInputs : AuthType , channel : Channel) : Promise<ReturnType | undefined> => {
   try {
       const {email , password} = userInputs;

       //login first find the superAdmin with the email
       const superAdmin = await superAdminModel.findOne({email : email});
       if(!superAdmin) {
           return {message : "No superadmin with this email."}
       }
       //comparePassword
       let isPassMatched;
       if(superAdmin.password !== undefined) {
         isPassMatched = await comparePassword(password , superAdmin.password)
       }

       //if password not matched
       if(!isPassMatched) {
           return {message : "Information Incorrect."}
       }
       
    //testing of queue
    channel.sendToQueue('superAdminQueue' , Buffer.from(JSON.stringify(superAdmin)))
       const payload = {
           id : superAdmin._id,
           role : superAdmin.role as any
       }
       const token = generateToken(payload)

       return {message : "Login successfull." , data: {token , id : superAdmin._id}}
       
   } catch (err) {
    console.log('error in superAdmin signup',err)
   }
}

export const updateSuperAdmin = async (userInputs : SuperAdminType) : Promise<ReturnType | undefined> => {
  try {
      const {email , id , password , isActive , name , mobileNumber} = userInputs;
      console.log('id' , id)
      console.log(typeof id)
      const superAdmin = await superAdminModel.findOne({_id: id});
      if(!superAdmin) {
        return {message : "No superadmin found."}  
      }
      //update user context
      const filter = {
          id : id
      }
      
      const update = {
          $set: {
              isActive : isActive,
              name : name,
              mobileNumber : mobileNumber
          },
      }

      const updateById = await repository.updateById(filter , update)
      
      return {message : "Information updated" , data : updateById as any}
  } catch (err) {
      console.log('error in updatedSuperAdmin' , err)
  }
}

export const deleteSuperAdmin = async (userInputs : DeleteSuperAdminType) : Promise<ReturnType | undefined> => {
     try {
         const {id} = userInputs
         const superAdmin = await superAdminModel.findOne({_id : id});
         if(!superAdmin) {
             return {message : "No superAdmin found"}
         }

         await superAdmin.remove();

         return {message : "superAdmin deleted successfully."}
     } catch (err) {
         console.log('error in delete superAdmin' , err)
     }
     
}

export const createAdmin = async (userInputs : AdminType, channel : Channel) : Promise<ReturnType | undefined> => {
   try {
       //we also have to store that admin details in superAdmin block
       const {email , password , name , instituteName, mobileNumber , id} = userInputs
       let superAdmin = await superAdminModel.findOne({_id : id});
       if(!superAdmin) {
           return {message : "No authorized to perform this action"}
       }
       //store data to superAdmin model
       const dataToSend = {
           email,
           password,
           name,
           instituteName,
           mobileNumber
       }
       console.log('superadmin admins------------' , superAdmin)
       superAdmin.admins?.push(dataToSend)

       //here is a bug newAdmin information not adding in superAdmin database
       console.log('superadmin admins' , superAdmin)
       await superAdmin.save();
       //hash admin password before sending or hash in admin service
       //we have to send this userInputs information to admin service to consume
       const wait = channel.publish(SUPER_ADMIN_EXCHANGE , CREATE_ADMIN_KEY, Buffer.from(JSON.stringify(dataToSend)))
       if(wait) {
           return {message : "Admin Created Successfully."}
       }
       //    const isSend = channel.sendToQueue('createAdmin' , Buffer.from(JSON.stringify(dataToSend)))
       //    if(isSend) {
       //        return {message : "Admin Created Successfully."}
       //    }
       return {message : "Something went's wrong..."}
       
   } catch (err) {
       console.log('error from created Admin' , err)
   }
}

export const activateAdmin =  async (userInputs : ActivateAdmin , channel : Channel) : Promise<ReturnType | undefined> => {
    try {
        const {email , isActive , id} = userInputs;
        let superAdmin = await superAdminModel.findOne({_id : id});
        if(!superAdmin) {
           return {message : "No authorized to perform this action"}
        }

        const dataToSend = {
            email,
            isActive
        }

        //send this message to admin service
        const wait = channel.publish(SUPER_ADMIN_EXCHANGE , ACTIVATE_ADMIN_KEY , Buffer.from(JSON.stringify(dataToSend)))
        if(wait) {
            return {message : "Admin Activated."}
        }
    } catch (err) {
        console.log('error from activate Admin' , err)
    }
}

export const deActivateAdmin =  async (userInputs : ActivateAdmin , channel : Channel) : Promise<ReturnType | undefined>  => {
    try {
        const {email , isActive , id} = userInputs;
        let superAdmin = await superAdminModel.findOne({_id : id});
        if(!superAdmin) {
           return {message : "No authorized to perform this action"}
        }

        const dataToSend = {
            email,
            isActive
        }

        //send this message to admin service
        const wait = channel.publish(SUPER_ADMIN_EXCHANGE , DEACTIVATE_ADMIN_KEY , Buffer.from(JSON.stringify(dataToSend)))
        if(wait) {
            return {message : "Admin Deactivated."}
        }
    } catch (err) {
        console.log('error from Deactivate Admin' , err)
    }
}