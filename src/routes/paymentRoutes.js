const express = require('express');
const router = express.Router();

/*
|--------------------------------------------------------------------------
| Temporary In-Memory Mock Store
|--------------------------------------------------------------------------
*/
const mockPayments = {};

/*
|--------------------------------------------------------------------------
| Initiate Payment (Mock)
|--------------------------------------------------------------------------
*/
router.post('/initiate', async (req, res) => {
  try {
    const { amount, provider, phone } = req.body;

    if (!amount || !provider || !phone) {
      return res.status(400).json({
        success: false,
        message: 'amount, provider, and phone are required'
      });
    }

    const reference = `JGP-${Date.now()}`;

    const payment = {
      reference,
      amount,
      provider,
      phone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    mockPayments[reference] = payment;

    return res.status(200).json({
      success: true,
      message: 'Mock payment initiated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Mock Initiate Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Mock payment initiation failed'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get Payment Status (Mock)
|--------------------------------------------------------------------------
*/
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = mockPayments[reference];

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Mock Status Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Mock status fetch failed'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Mock Confirm Payment
|--------------------------------------------------------------------------
*/
router.post('/mock-confirm/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const { status } = req.body;

    if (!['successful', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be successful or failed'
      });
    }

    const payment = mockPayments[reference];

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = status;
    payment.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: 'Mock payment updated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Mock Confirm Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Mock confirm failed'
    });
  }
});

module.exports = router;