import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patnRoutes from './routes/patnRoutes.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'https://iet-hyderabad-frontend.llp.trizenventures.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    // Add CORS headers directly for debugging
    res.header('Access-Control-Allow-Origin', 'https://iet-hyderabad-frontend.llp.trizenventures.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        origin: req.get('origin'),
        headers: req.headers
    });
    next();
});

// Routes
app.use('/api/protoplan', protoPlanRoutes);
app.use('/api/patn', patnRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});