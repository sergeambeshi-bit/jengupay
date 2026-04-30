const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/
app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'JenguPay API Running',
    version: '1.0.0'
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
app.use('/api/payments', paymentRoutes);

/*
|--------------------------------------------------------------------------
| Local Development Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 JenguPay server running on port ${PORT}`);
  });
}

/*
|--------------------------------------------------------------------------
| Export For Vercel
|--------------------------------------------------------------------------
*/
module.exports = app;