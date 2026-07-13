import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load environmental variables
dotenv.config();

// Import database connection to trigger setup/testing
import './config/db.js';

// Import middlewares
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import claimRoutes from './routes/claimRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Root Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Portal Sespim Polri API is running smoothly.',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inpassing-claims', claimRoutes);
app.use('/api', contentRoutes);

// Fallback Routes for 404 and Global Errors
app.use(notFound);
app.use(errorHandler);

// Set Port and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
