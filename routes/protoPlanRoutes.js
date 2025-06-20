import express from 'express';
import multer from 'multer';
import { PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { connectToDatabase, collections } from '../utils/db.js';
import minioClient from '../utils/minioClient.js';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const MINIO_ENDPOINT = 'https://lmsbackendminio-api.llp.trizenventures.com';
const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'iet-protoplant-payment';

// Helper function to generate unique filename
const generateUniqueFileName = (originalname) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalname.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
};

// Helper function to verify bucket exists
async function verifyBucket() {
    try {
        console.log('Verifying MinIO bucket...');
        const command = new HeadBucketCommand({
            Bucket: MINIO_BUCKET
        });
        await minioClient.send(command);
        console.log('Bucket verification successful:', MINIO_BUCKET);
        return true;
    } catch (error) {
        console.error('Bucket verification failed:', {
            bucket: MINIO_BUCKET,
            error: error.message,
            time: new Date().toISOString()
        });
        return false;
    }
}

// Add test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'ProtoPlanet API is working!' });
});

router.post('/register', upload.single('screenshot'), async (req, res) => {
    console.log('=== ProtoPlant Registration Request Received ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file);
    console.log('================================');

    try {
        const formData = req.body;
        let imageUrl = null;

        // Log the incoming data
        console.log('Processing registration for team:', formData.teamName);
        console.log('Institution:', formData.institutionName);
        console.log('Member 1:', formData.member1);
        console.log('Member 2:', formData.member2);
        console.log('Member 3:', formData.member3);

        // Parse JSON strings back to objects
        try {
            if (formData.projectAbstract) {
                formData.projectAbstract = JSON.parse(formData.projectAbstract);
            }
            ['member1', 'member2', 'member3'].forEach(member => {
                if (formData[member]) {
                    formData[member] = JSON.parse(formData[member]);
                }
            });
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON data in form submission'
            });
        }

        // Validate required fields for ProtoPlanet registration
        const requiredFields = [
            'teamName', 
            'institutionName', 
            'cityState', 
            'projectTitle',
            'projectAbstract',
            'feeType', 
            'transactionId'
        ];
        
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate project abstract fields
        const requiredProjectFields = [
            'track',
            'problemStatement',
            'proposedSolution',
            'systemArchitecture',
            'technologicalImpact'
        ];

        const missingProjectFields = requiredProjectFields.filter(
            field => !formData.projectAbstract[field]
        );

        if (missingProjectFields.length > 0) {
            console.error('Missing required project fields:', missingProjectFields);
            return res.status(400).json({
                success: false,
                message: `Missing required project fields: ${missingProjectFields.join(', ')}`
            });
        }

        // Handle file upload to MinIO if a file was provided
        if (req.file) {
            console.log('Processing screenshot upload...', {
                originalName: req.file.originalname,
                size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
                mimeType: req.file.mimetype,
                bucket: MINIO_BUCKET,
                buffer: req.file.buffer ? 'Present' : 'Missing'
            });

            try {
                const bucketExists = await verifyBucket();
                if (!bucketExists) {
                    throw new Error('Storage bucket not available');
                }

                const uniqueFileName = generateUniqueFileName(req.file.originalname);
                console.log('Generated unique filename:', uniqueFileName);
                
                const uploadParams = {
                    Bucket: MINIO_BUCKET,
                    Key: `protoplanet/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                };

                console.log('Uploading to MinIO with params:', {
                    ...uploadParams,
                    Body: 'Buffer data'
                });

                try {
                    await minioClient.send(new PutObjectCommand(uploadParams));
                    console.log('Screenshot uploaded successfully to MinIO');
                    imageUrl = `https://${MINIO_ENDPOINT}/${MINIO_BUCKET}/protoplanet/${uniqueFileName}`;
                    console.log('Generated image URL:', imageUrl);
                } catch (uploadError) {
                    console.error('MinIO upload error:', {
                        error: uploadError.message,
                        code: uploadError.code,
                        requestId: uploadError.$metadata?.requestId
                    });
                    throw new Error('Failed to upload screenshot to storage');
                }
            } catch (error) {
                console.error('File upload error:', error);
                throw new Error('Failed to upload screenshot: ' + error.message);
            }
        } else {
            console.warn('No screenshot file provided in request');
            return res.status(400).json({
                success: false,
                message: 'Payment screenshot is required'
            });
        }

        // Connect to MongoDB and save the form data
        console.log('Connecting to MongoDB...');
        const db = await connectToDatabase();
        const collection = db.collection(collections.protoPlant);

        // Format the data similar to PATN registration but with ProtoPlanet fields
        const registrationData = {
            // Common fields with PATN
            title: formData.member1?.title || '',
            fullName: formData.member1?.name || '',
            category: 'team', // For ProtoPlanet, it's always a team
            department: formData.member1?.yearBranch || '',
            instituteName: formData.institutionName,
            isIETMember: formData.member1?.isIETMember ? 'yes' : 'no',
            mobileNumber: formData.member1?.phone || '',
            emailAddress: formData.member1?.email || '',
            
            // ProtoPlanet specific fields
            teamName: formData.teamName,
            cityState: formData.cityState,
            projectTitle: formData.projectTitle,
            projectAbstract: formData.projectAbstract,
            feeType: formData.feeType,
            transactionId: formData.transactionId,
            screenshotUrl: imageUrl,
            
            // Team members
            teamMembers: {
                member1: formData.member1,
                member2: formData.member2,
                member3: formData.member3
            },

            // Metadata
            submittedAt: new Date(),
            status: 'submitted',
            registrationId: `PP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            lastUpdated: new Date(),
            registrationType: 'protoPlant'
        };

        // Insert into MongoDB
        console.log('Saving registration data to collection:', collections.protoPlant);
        const result = await collection.insertOne(registrationData);
        console.log('ProtoPlant Registration saved successfully:', {
            registrationId: registrationData.registrationId,
            documentId: result.insertedId,
            timestamp: new Date().toISOString()
        });

        // Send success response with registration details
        res.status(200).json({
            success: true,
            message: 'Registration successful',
            data: {
                teamName: registrationData.teamName,
                submittedAt: registrationData.submittedAt
            }
        });

    } catch (error) {
        console.error('ProtoPlant Registration error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message,
            error: error.message,
            errorCode: error.code || 'UNKNOWN_ERROR'
        });
    }
});

// Add a route to check registration status
router.get('/status/:registrationId', async (req, res) => {
    try {
        const { registrationId } = req.params;
        console.log('Checking registration status for:', registrationId);

        const db = await connectToDatabase();
        const collection = db.collection(collections.protoPlant);
        
        const registration = await collection.findOne({ registrationId });
        
        if (!registration) {
            console.log('Registration not found:', registrationId);
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        console.log('Registration status found:', {
            registrationId,
            status: registration.status
        });

        res.json({
            success: true,
            data: {
                registrationId: registration.registrationId,
                teamName: registration.teamName,
                status: registration.status,
                submittedAt: registration.submittedAt,
                lastUpdated: registration.lastUpdated
            }
        });

    } catch (error) {
        console.error('Error checking registration status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check registration status',
            error: error.message
        });
    }
});

export default router; 