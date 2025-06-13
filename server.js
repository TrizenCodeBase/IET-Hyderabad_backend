import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import patnRoutes from './routes/patnRoutes.js';

dotenv.config();

const app = express();

// ✅ Clean CORS middleware
app.use(cors({
    origin: 'https://iethyderabad.trizenventures.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ✅ OPTIONAL: make sure preflight OPTIONS handled automatically
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/protoplan', protoPlanRoutes);
app.use('/api/patn', patnRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
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
