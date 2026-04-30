const express = require('express');
const router = express.Router();
const db = require('../config/db');

/*
|--------------------------------------------------------------------------
| Initiate Payment
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

    const result = await db.query(
      `
      INSERT INTO payments (reference, amount, provider, phone, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [reference, amount, provider, phone, 'pending']
    );

    return res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('DB Insert Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get Payment Status
|--------------------------------------------------------------------------
*/
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const result = await db.query(
      `
      SELECT * FROM payments
      WHERE reference = $1
      LIMIT 1
      `,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Status Fetch Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Mock Confirm Payment (Testing Only)
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

    const result = await db.query(
      `
      UPDATE payments
      SET status = $1
      WHERE reference = $2
      RETURNING *
      `,
      [status, reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Mock Confirm Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

module.exports = router;