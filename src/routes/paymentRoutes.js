const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { validateInitiatePayment } = require('../middleware/validatePayment');

// POST /api/payments/initiate
router.post('/initiate', validateInitiatePayment, PaymentController.initiatePayment);

// POST /api/payments/mock-confirm/:reference  (dev/testing)
router.post('/mock-confirm/:reference', PaymentController.confirmPayment);

// GET  /api/payments/
router.get('/', PaymentController.listPayments);

// GET  /api/payments/:reference
router.get('/:reference', PaymentController.getPayment);

module.exports = router;