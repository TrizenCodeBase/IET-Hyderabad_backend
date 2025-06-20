import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://projectstrizen:YOUR_PASSWORD_HERE@cluster0.p1pxurw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = process.env.MONGODB_DB || 'test';

// Export collection names for different registration types
export const collections = {
    protoPlant: process.env.PROTOPLANT_COLLECTION || 'iet-protoplant-registrations',
    patn: process.env.PATN_COLLECTION || 'patn-registrations'
};

let client;

const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 50,
    retryWrites: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

export async function connectToDatabase() {
    try {
        if (!client) {
            console.log('Connecting to MongoDB...');
            client = await MongoClient.connect(uri, options);
            console.log('MongoDB connection successful!');
        }
        return client.db(dbName);
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            time: new Date().toISOString()
        });
        // Reset client on connection error
        client = null;
        throw error;
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    }
});

export default { connectToDatabase };