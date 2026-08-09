import mongoose from 'mongoose'
import {ENV} from './env.js'
import dns from 'dns'

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('Could not set custom DNS servers:', e.message);
}

export const connectDB = async () => {
    try {
        const { MONGO_URI  } = ENV;
        if (!MONGO_URI) throw new Error('MONGO_URI is not set')

        const conn = await mongoose.connect(ENV.MONGO_URI)
        console.log('MongoDB Connected', conn.connection.host)

    } catch (error) {

        console.error('Error connection to mongoDB', error)
        process.exit(1)

    }
}