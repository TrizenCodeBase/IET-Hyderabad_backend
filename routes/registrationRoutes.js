import express from 'express';
import Registration from '../models/Registration.js';
import { connectToDatabase, collections } from '../utils/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  let db;
  try {
    console.log('Received PATN registration data:', req.body);

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

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Connect to database first
    db = await connectToDatabase();
    const collection = db.collection(collections.patn);

    // Check for existing email
    const existingRegistration = await collection.findOne({ emailAddress: req.body.emailAddress });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered'
      });
    }

    // Prepare registration data
    const registrationData = {
      ...req.body,
      registrationId: `PATN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'submitted',
      submittedAt: new Date(),
      lastUpdated: new Date(),
      registrationType: 'patn'
    };

    // Save to database
    const result = await collection.insertOne(registrationData);
    console.log('PATN Registration saved successfully:', {
      registrationId: registrationData.registrationId,
      documentId: result.insertedId
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        registrationId: registrationData.registrationId,
        email: registrationData.emailAddress
      }
    });
  } catch (error) {
    console.error('PATN Registration error:', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      message: 'Failed to process registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all PATN registrations (for admin purposes)
router.get('/registrations', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collections.patn);
    const registrations = await collection.find({})
      .sort({ submittedAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching PATN registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

export default router; 