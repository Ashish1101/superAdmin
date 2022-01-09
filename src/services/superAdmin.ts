//this file will contain all the controller related to superAdmin
import databaseLayer from '../database'
const superAdminModel = databaseLayer.superAdminModel
const repository = databaseLayer.repository
import xlsx from 'node-xlsx'
import {SUPER_ADMIN_EXCHANGE , CREATE_ADMIN_KEY, ACTIVATE_ADMIN_KEY, DEACTIVATE_ADMIN_KEY , STUDENT_BULK_UPLOAD} from '../queue/types'
import {HashPassword , comparePassword} from '../utils/passwordHash'
import generateToken from '../utils/generateJwtToken'
import { Channel } from 'amqplib'
import fs from 'fs'
import path from 'path'

type StudentType = {
  name : string
  email : string
  mobileNumber: number
  address : string
  joinDate : Date
  fees : number
  instituteName : string
  dob : Date
  parentNumber : number
  password : Promise<string>
  instituteId: string
}

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

export const bulkStudentUpload = async (userInputs : any , channel : Channel) : Promise<ReturnType | undefined > => {
    try {
        const {file , email} = userInputs;
        const filePath = `${process.env.BASE_DIR}/upload/${file.filename}`
        const workSheetFromFile = xlsx.parse(fs.readFileSync(filePath) , {blankrows: false})
        console.log('workbooksheet' , workSheetFromFile)

        //will send the tailored data to queue
        const res : StudentType[] = []
        let data = workSheetFromFile[0].data
        console.log('myDATa--------------------', data)
        

        //shift used because to delete first row that is just for columns name
        //will use that for validating file
        data.shift()
        console.log('myDATa--------------------', data)

        //TODO we have to check the file format by the xls sheet first row if the format is incorrect
        //then throw an error

        data.forEach( async (item : any)=> {
            let convertToObj  = {
               name : item[0],
               email : item[1],
               mobileNumber: item[2],
               address: item[3],
               joinDate : new Date(1899 , 12 , item[4]),
               fees : item[5],
               instituteName: item[6],
               dob: new Date(1899 , 12 , item[7]),
               parentNumber : item[8],
               password: HashPassword(item[9]),
               instituteId: email
            }
            res.push(convertToObj)
         })
        const dataToSend = {
           data : res,
           email : email
        }


        //SEND THIS DATA TO FANOUT EXCHANGE
        const wait = channel.publish(STUDENT_BULK_UPLOAD , '' , Buffer.from(JSON.stringify(dataToSend)))
        //we will extract the data from the file and store that data in 
        if(wait) {
            return { message : "File uploaded", data : dataToSend.data} 
        }
        //json format and send that data to two queue 
        //one for admin and one for student
    } catch (err) {
        console.log('error from student bulk upload' , err)
    }
}