import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categoryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import productImagesRoutes from './routes/productImagesRoutes.js';
import shiftAssignmentRoutes from './routes/shiftAssignmentRoutes.js';
import shiftAttendanceRoutes from './routes/shiftAttendanceRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import rfidCardRoutes from './routes/rfidCardRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/product-images', productImagesRoutes);
app.use('/api/shifts', shiftAssignmentRoutes);        
app.use('/api/attendance', shiftAttendanceRoutes); 
app.use('/api/payroll', payrollRoutes);       
app.use('/api/rfid-cards', rfidCardRoutes);       
app.use('/api/orders', orderRoutes);

// Test route
app.get('/', (req, res) => res.send('KSMS Backend is running'));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
