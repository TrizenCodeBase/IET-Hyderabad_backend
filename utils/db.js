import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://projectstrizen:YOUR_PASSWORD_HERE@cluster0.p1pxurw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = process.env.MONGODB_DB || 'test';
export const collectionName = process.env.MONGODB_COLLECTION || 'iet-protoplant-registrations';

let client;

export async function connectToDatabase() {
    try {
        if (!client) {
            console.log('Connecting to MongoDB...');
            client = await MongoClient.connect(uri);
            console.log('MongoDB connection successful!');
        }
        return client.db(dbName);
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            time: new Date().toISOString()
        });
        throw error;
    }
}

export default { connectToDatabase };