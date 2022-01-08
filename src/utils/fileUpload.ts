import multer from 'multer'
import {Request} from 'express'
import path from 'path'
//CREATE A DISKSTORAGE

type MimeType = string[]

const storage = multer.diskStorage({
    destination: function (req : Request , file : Express.Multer.File , cb : any) {
          cb(null , path.resolve('./src/upload'))
    },

    filename: function (req : Request , file : Express.Multer.File , cb : any) {
        cb(null , Date.now() + '-' + path.extname(file.originalname))
    }
})


const mimeArray : MimeType = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

const fileFilter = (req : Request , file : Express.Multer.File , cb : any) => {
     if(mimeArray.includes(file.mimetype)) {
         cb(null , true)
     }
     cb(null, false)
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
})

export default upload