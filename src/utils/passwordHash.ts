import * as bcryptjs from 'bcryptjs'


export const HashPassword = async ( password : string ) => {
   try {
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(password , salt)
      return hash
   } catch (err) {
       console.log('error in password hash' , err)
       throw err
   }
}

export const comparePassword = async (newPass : string , hashedPass : string)  => {
     try {
         const match = await bcryptjs.compare(newPass , hashedPass);
         return match;
     } catch (err) {
        console.log('error in password match' , err)
        throw err
     }
}