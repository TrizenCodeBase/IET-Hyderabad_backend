import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protoPlanRoutes from './routes/protoPlanRoutes.js';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();

// Define allowed origins
const ALLOWED_ORIGINS = [
  'https://iet-hyderabad-frontend.llp.trizenventures.com',
  'http://localhost:8080',
  'http://localhost:3000'
];

// Detailed request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'No origin';
  console.log(`
    [${timestamp}]
    Method: ${req.method}
    URL: ${req.url}
    Origin: ${origin}
    Headers: ${JSON.stringify(req.headers, null, 2)}
  `);
  next();
});

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request has no origin');
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      console.log(`Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`Origin ${origin} is not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
  } else {
    res.status(403).end();
  }
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request from origin:', req.headers.origin);
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/protoplan', protoPlanRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    Server is running on port ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    Allowed origins: ${JSON.stringify(ALLOWED_ORIGINS, null, 2)}
    Timestamp: ${new Date().toISOString()}
  `);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 