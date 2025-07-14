
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patn from './routes/registrationRoutes.js';
import innothonRoutes from './routes/innothonRoutes.js';

dotenv.config();

// Mongoose connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Mongoose connected to MongoDB!');
}).catch((err) => {
  console.error('Mongoose connection error:', err);
});

const app = express();

// CORS configuration - Updated to include production domains
const corsOptions = {
    origin: [
        'http://localhost:8081', 
        'http://localhost:8080', 
        'http://localhost:3000',
        'https://iethyderabad.trizenventures.com',  // Production frontend
        'https://iet-hyderabad-backend.llp.trizenventures.com',
        'https://iethlnevents.in'// Production backend (for self-requests)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/protoplan', protoPlanRoutes);
app.use('/api/patn', patn);
app.use('/api/innothon', innothonRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
