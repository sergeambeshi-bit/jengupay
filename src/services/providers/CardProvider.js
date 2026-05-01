const axios = require('axios');

class CardProvider {
  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.currency = process.env.CARD_CURRENCY || 'xaf';
  }

  _isConfigured() {
    return !!this.stripeSecretKey;
  }

  async requestPayment({ amount, phone, reference }) {
    if (!this._isConfigured()) {
      // Mock mode — credentials not configured
      return { transactionId: `CARD-MOCK-${Date.now()}`, status: 'PENDING' };
    }

    const params = new URLSearchParams({
      amount: String(Math.round(Number(amount) * 100)), // Stripe uses smallest currency unit
      currency: this.currency,
      description: `JenguPay - ${reference}`,
      'metadata[reference]': reference,
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/payment_intents',
      params.toString(),
      {
        headers: {
          Authorization: `Bearer ${this.stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return {
      transactionId: response.data.id,
      clientSecret: response.data.client_secret,
      status: 'PENDING',
    };
  }

  async getTransactionStatus(transactionId) {
    if (!this._isConfigured()) {
      return { status: 'succeeded' };
    }

    const response = await axios.get(
      `https://api.stripe.com/v1/payment_intents/${transactionId}`,
      { headers: { Authorization: `Bearer ${this.stripeSecretKey}` } }
    );
    return response.data;
  }
}

module.exports = new CardProvider();
