import {prop , getModelForClass} from '@typegoose/typegoose'
import {Types} from 'mongoose'

type AdminsType = {
    email?: string
    name?: string
    mobile?: number
    institueName?: string
    password?: string
}


class SuperAdmin {
    @prop({type : () => String})
    public name?: string;

    @prop({unique: true , type: () => String})
    public email?: string;

    @prop({type: () => String}) 
    public password? : string;

    @prop({type: () => Boolean , default : false})
    public isActive? : boolean;

    @prop({type : () => Number})
    public mobileNumber?: number

    @prop({type: () => String , default : 'superAdmin'})
    public role?: string

    @prop({type: () =>  [Object]}) 
    public admins!: AdminsType[]
}

const superAdminModel = getModelForClass(SuperAdmin);
export default superAdminModel
