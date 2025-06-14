import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patnRoutes from './routes/patnRoutes.js';

dotenv.config();

const app = express();

// ✅ Allowed origins as Set (better performance)
const allowedOrigins = new Set([
    'http://localhost:8081',
    'http://localhost:8080',
    'http://localhost:3000',
    'https://iethyderabad.trizenventures.com',
    'https://iet-hyderabad-backend.llp.trizenventures.com'
]);

// ✅ CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman, server-side requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.has(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked for origin: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// ✅ Apply CORS globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/protoplan', protoPlanRoutes);
app.use('/api/patn', patnRoutes);

// ✅ Error handler
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

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
