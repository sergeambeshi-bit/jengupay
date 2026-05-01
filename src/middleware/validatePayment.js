const SUPPORTED_PROVIDERS = ['mtn', 'orange', 'card'];

const validateInitiatePayment = (req, res, next) => {
  const { amount, provider, phone } = req.body;
  const errors = [];

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    errors.push('amount must be a positive number');
  }

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider.toLowerCase())) {
    errors.push(`provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}`);
  }

  if (provider && provider.toLowerCase() !== 'card' && !phone) {
    errors.push('phone is required for mobile money providers');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  next();
};

module.exports = { validateInitiatePayment };
