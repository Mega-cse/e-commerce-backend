import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoDBConnectionString = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoDBConnectionString);
        console.log('Connected to DB');
    } catch (error) {
        console.error('Error connecting to DB:', error);
        process.exit(1); // Exit process with failure code
    }
}

export default connectDB;
