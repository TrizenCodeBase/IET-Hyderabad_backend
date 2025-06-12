import express from 'express';
import Registration from '../models/Registration.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);

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

    // Create new registration
    const registration = new Registration(req.body);
    
    // Save to database
    const savedRegistration = await registration.save();
    console.log('Registration saved successfully:', savedRegistration);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: savedRegistration
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process registration'
    });
  }
});

// Get all registrations (for testing purposes)
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

export default router; 