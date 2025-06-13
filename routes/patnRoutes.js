import express from 'express';
import { connectToDatabase } from '../utils/db.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/register', async (req, res) => {
    console.log('=== PATN Registration Request Received ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('================================');

    try {
        const formData = req.body;

        // Validate required fields
        const requiredFields = [
            'title',
            'fullName',
            'category',
            'department',
            'instituteName',
            'isIETMember',
            'mobileNumber',
            'emailAddress',
            'zoneVenue',
            'youtubeLink'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Connect to MongoDB and save the form data
        console.log('Connecting to MongoDB...');
        const db = await connectToDatabase();
        const collection = db.collection('registrations');

        const registrationData = {
            ...formData,
            submittedAt: new Date(),
            status: 'submitted',
            registrationId: `PATN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            lastUpdated: new Date(),
            registrationType: 'patn'
        };

        // Insert into MongoDB
        console.log('Saving registration data to collection: registrations');
        const result = await collection.insertOne(registrationData);
        console.log('Registration saved successfully:', {
            registrationId: registrationData.registrationId,
            documentId: result.insertedId,
            timestamp: new Date().toISOString()
        });

        // Send success response with registration details
        res.status(200).json({
            success: true,
            message: 'Registration successful',
            data: {
                registrationId: registrationData.registrationId,
                submittedAt: registrationData.submittedAt
            }
        });

    } catch (error) {
        console.error('Registration error:', {
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
        const collection = db.collection('registrations');
        
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
                fullName: registration.fullName,
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