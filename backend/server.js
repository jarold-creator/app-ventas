require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection error:', err));
