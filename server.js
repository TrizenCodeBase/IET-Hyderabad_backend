import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patnRoutes from './routes/patnRoutes.js';

dotenv.config();

const app = express();

// Basic CORS setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://iethyderabad.trizenventures.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS method
    if (req.method === 'OPTIONS') {
        return res.status(200).json({
            body: "OK"
        });
    }

    next();
});

// Additional CORS setup using cors package
app.use(cors({
    origin: 'https://iethyderabad.trizenventures.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
    res.status(200).end();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    
    // Ensure CORS headers are set even for error responses
    res.header('Access-Control-Allow-Origin', 'https://iethyderabad.trizenventures.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    
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