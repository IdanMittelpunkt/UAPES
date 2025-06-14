import mongoose from 'mongoose';
import config from '../config/external.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri, {});
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('MongoDB connection failed: ', error.message);
        process.exit(1);
    }
}
