import * as jwt from 'jsonwebtoken'
import {Request , Response , NextFunction}  from 'express'

export default async (req : Request, res : Response, next : NextFunction) => {
   const headers = req.headers['authorization']
   const token = headers?.split(" ")[1]
   if(!token) {
       return res.status(403).send('Not Authorized')
   }
   try {
       const decoded = jwt.verify(token , process.env.JWT_SECRET as any);
       if(!decoded) {
           throw new Error('Token Validation failed')
       }
       (req as any).user = decoded
       next();
   } catch (err) {
       console.log('error in verify' , err)
       return res.status(403).send('Invalid token')
   }
}