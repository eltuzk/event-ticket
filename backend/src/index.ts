import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.route';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: null, message: 'Server is running healthily' });
});

// Error handling middleware should be the last middleware
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('Database has been initialized!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error during Database initialization:', err);
  });
