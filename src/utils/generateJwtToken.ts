import * as jwt from 'jsonwebtoken'

interface jwtPayload extends jwt.JwtPayload {
   id : object
   role : string
}

export default (payload: jwtPayload) => {
   return jwt.sign(payload , process.env.JWT_SECRET as any , {expiresIn : '1d'})
}