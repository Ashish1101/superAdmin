import mongoose from 'mongoose'

export default async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as any);
        console.log('connected to database')
    } catch (err) {
        console.log('error in database connection')
    }
}