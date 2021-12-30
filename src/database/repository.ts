import superAdminModel from "./models/SuperAdmin"

type FilterType = {
    id : string
}

type Update = object

export default {
    updateById : async (filter : FilterType, update : Update) => {
        try {
            const findById = await superAdminModel.findOneAndUpdate(filter , update);
            return findById
        } catch (err) {
            console.log('error in updateByID')
        }
    }
}