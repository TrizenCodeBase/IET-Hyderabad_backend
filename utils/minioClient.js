import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Ensure endpoint always has https:// prefix
const getEndpointUrl = (endpoint) => {
    if (!endpoint) {
        endpoint = 'lmsbackendminio-api.llp.trizenventures.com';
    }
    return endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
};

// Create MinIO client with direct credentials
const minioClient = new S3Client({
    endpoint: getEndpointUrl(process.env.MINIO_ENDPOINT),
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'b72084650d4c21dd04b801f0',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'be2339a15ee0544de0796942ba3a85224cc635'
    },
    forcePathStyle: true,
    region: 'us-east-1'
});

// Test MinIO connection
async function testMinioConnection() {
    try {
        const endpoint = getEndpointUrl(process.env.MINIO_ENDPOINT);
        console.log('Testing MinIO connection...');
        console.log('MinIO Endpoint:', endpoint);
        
        const command = new ListBucketsCommand({});
        const response = await minioClient.send(command);
        
        console.log('MinIO connection successful!');
        console.log('Available buckets:', response.Buckets?.map(b => b.Name));
        return true;
    } catch (error) {
        console.error('MinIO connection error:', {
            message: error.message,
            code: error.code,
            time: new Date().toISOString()
        });
        return false;
    }
}

// Test connection on startup
testMinioConnection();

export default minioClient; 