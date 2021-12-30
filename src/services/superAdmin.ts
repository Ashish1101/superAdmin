//this file will contain all the controller related to superAdmin
import databaseLayer from '../database'
const superAdminModel = databaseLayer.superAdminModel
const repository = databaseLayer.repository
import {HashPassword , comparePassword} from '../utils/passwordHash'
import generateToken from '../utils/generateJwtToken'


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

type DeleteSuperAdminType = {
    id : string
}

export const signUp = async (userInputs : AuthType) : Promise<ReturnType | undefined> => {
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

export const signin = async (userInputs : AuthType) : Promise<ReturnType | undefined> => {
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

       //jwt token
    //    console.log(typeof superAdmin.id)
    //    console.log(typeof superAdmin._id)
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