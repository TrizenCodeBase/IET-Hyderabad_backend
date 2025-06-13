import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patnRoutes from './routes/patnRoutes.js';  // You were missing this import

dotenv.config();

const app = express();

// ✅ Allowed origins as array
const allowedOrigins = [
    'http://localhost:8081', 
    'http://localhost:8080', 
    'http://localhost:3000',
    'https://iethyderabad.trizenventures.com',
    'https://iet-hyderabad-backend.llp.trizenventures.com'
];

// ✅ Dynamic origin handling (this is the most important part)
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type'],
    credentials: false // you don't need credentials here as you're not using cookies
};

// ✅ Apply CORS before any other middleware
app.use(cors(corsOptions));

// ✅ Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/protoplan', protoPlanRoutes);
app.use('/api/patn', patnRoutes);

// ✅ Error handling
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

// ✅ Server startup
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
