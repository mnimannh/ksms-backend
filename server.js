import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categoryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import variantRoutes from './routes/variantRoutes.js';


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/variants', variantRoutes);

// Test route
app.get('/', (req, res) => res.send('KSMS Backend is running'));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
