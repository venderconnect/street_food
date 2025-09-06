import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
// Basic rate limiting to mitigate brute force / DoS attempts
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
// Limit JSON body size to prevent large payload abuse
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);
export default app;
