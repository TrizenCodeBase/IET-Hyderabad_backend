import express from 'express';
import InnothonRegistration from '../models/InnothonRegistration.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const data = req.body;
    // Validate at least one problem statement field
    if (!data.problemStatement && !data.customProblemStatement) {
      return res.status(400).json({
        success: false,
        message: 'Either a problem statement must be selected or a custom problem statement must be provided.'
      });
    }
    // Create registrationId
    data.registrationId = `INN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    data.status = 'submitted';
    data.lastUpdated = new Date();
    data.registrationType = 'innothon';
    // Log before saving
    console.log('Attempting to save Innothon registration:', data);
    // Save to DB
    const registration = new InnothonRegistration(data);
    await registration.save();
    // Log after saving
    console.log('Innothon registration saved successfully:', data.registrationId);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        registrationId: data.registrationId,
        email: data.leaderEmail
      }
    });
  } catch (error) {
    console.error('Innothon Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process registration. Please try again later.',
      error: error.message
    });
  }
});

export default router; 