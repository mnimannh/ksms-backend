import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import categoryRoutes from './routes/categoryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import productImagesRoutes from './routes/productImagesRoutes.js';
import shiftAssignmentRoutes from './routes/shiftAssignmentRoutes.js';
import shiftAttendanceRoutes from './routes/shiftAttendanceRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import rfidCardRoutes from './routes/rfidCardRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import inventoryReportRoutes from './routes/inventoryReportRoutes.js'
import shiftPayrollReportRoutes from './routes/shiftPayrollReportRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import hourlyRateRoutes from './routes/hourlyRateRoutes.js'

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/product-images', productImagesRoutes);
app.use('/api/shifts', shiftAssignmentRoutes);        
app.use('/api/attendance', shiftAttendanceRoutes); 
app.use('/api/payroll', payrollRoutes);       
app.use('/api/rfid-cards', rfidCardRoutes);       
app.use('/api/orders', orderRoutes);
app.use('/api/alarm', alarmRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);
app.use('/api/reports/inventory', inventoryReportRoutes)
app.use('/api/reports/shift-payroll', shiftPayrollReportRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/hourly-rates', hourlyRateRoutes)

// Test route
app.get('/', (req, res) => res.send('KSMS Backend is running'));

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on all interfaces on port ${PORT}`));
