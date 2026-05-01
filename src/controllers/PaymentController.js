const Payment = require('../models/Payment');
const generateReference = require('../utils/generateReference');
const MTNProvider = require('../services/providers/MTNProvider');
const OrangeProvider = require('../services/providers/OrangeProvider');
const CardProvider = require('../services/providers/CardProvider');

const providers = {
  mtn: MTNProvider,
  orange: OrangeProvider,
  card: CardProvider,
};

const PaymentController = {
  async initiatePayment(req, res) {
    try {
      const { amount, provider, phone = null, metadata = null } = req.body;
      const normalizedProvider = provider.toLowerCase();
      const reference = generateReference();

      const providerService = providers[normalizedProvider];

      let providerResult;
      try {
        providerResult = await providerService.requestPayment({
          amount: Number(amount),
          phone,
          reference,
        });
      } catch (providerError) {
        console.error(`Provider [${normalizedProvider}] error:`, providerError.message);
        return res.status(502).json({
          success: false,
          message: `Payment provider error: ${providerError.message}`,
        });
      }

      const payment = await Payment.create({
        reference,
        amount: Number(amount),
        provider: normalizedProvider,
        phone,
        status: 'pending',
        providerTxId: providerResult.transactionId || providerResult.payToken || null,
        metadata,
      });

      return res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          ...payment,
          ...(providerResult.paymentUrl && { paymentUrl: providerResult.paymentUrl }),
          ...(providerResult.clientSecret && { clientSecret: providerResult.clientSecret }),
        },
      });
    } catch (error) {
      console.error('Initiate Payment Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Payment initiation failed',
      });
    }
  },

  async getPayment(req, res) {
    try {
      const { reference } = req.params;
      const payment = await Payment.findByReference(reference);

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      return res.status(200).json({ success: true, data: payment });
    } catch (error) {
      console.error('Get Payment Error:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve payment' });
    }
  },

  async confirmPayment(req, res) {
    try {
      const { reference } = req.params;
      const { status } = req.body;

      if (!['successful', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "status must be 'successful' or 'failed'",
        });
      }

      const payment = await Payment.findByReference(reference);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      if (payment.status !== 'pending') {
        return res.status(409).json({
          success: false,
          message: `Payment is already ${payment.status}`,
        });
      }

      const updated = await Payment.updateStatus(reference, status);
      return res.status(200).json({
        success: true,
        message: 'Payment status updated',
        data: updated,
      });
    } catch (error) {
      console.error('Confirm Payment Error:', error);
      return res.status(500).json({ success: false, message: 'Failed to confirm payment' });
    }
  },

  async listPayments(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;
      const payments = await Payment.findAll({ limit, offset });

      return res.status(200).json({
        success: true,
        data: payments,
        pagination: { limit, offset },
      });
    } catch (error) {
      console.error('List Payments Error:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
    }
  },
};

module.exports = PaymentController;
