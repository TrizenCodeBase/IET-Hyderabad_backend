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
    // For development/testing - allow requests with no origin 
    if (!origin) {
      console.log('Request with no origin');
      return callback(null, true);
    }
    
    // Check against allowed origins
    const allowedOrigins = [
      'https://iet-hyderabad-frontend.llp.trizenventures.com',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 86400
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Add pre-flight OPTIONS handling
app.options('*', cors(corsOptions));

// Add headers middleware for additional CORS support
app.use((req, res, next) => {
  // Debugging: Log the current origin
  console.log('Request from origin:', req.headers.origin);
  
  // Ensure CORS headers are set
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  next();
});

// Health check endpoint with detailed logging
app.get('/health', (req, res) => {
  console.log('Health check request received:');
  console.log('- Origin:', req.headers.origin);
  console.log('- Headers:', req.headers);
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials')
    }
  });
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
  console.error('Error occurred:', {
    message: err.message,
    origin: req.headers.origin,
    path: req.path,
    method: req.method
  });

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