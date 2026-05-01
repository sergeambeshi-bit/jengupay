const axios = require('axios');

class MTNProvider {
  constructor() {
    this.baseUrl = process.env.MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MTN_API_USER;
    this.apiKey = process.env.MTN_API_KEY;
    this.callbackUrl = process.env.MTN_CALLBACK_URL;
    this.environment = process.env.MTN_ENVIRONMENT || 'sandbox';
    this.currency = process.env.MTN_CURRENCY || 'XAF';
  }

  _isConfigured() {
    return !!(this.subscriptionKey && this.apiUser && this.apiKey);
  }

  async _getAccessToken() {
    const credentials = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      }
    );
    return response.data.access_token;
  }

  async requestPayment({ amount, phone, reference }) {
    if (!this._isConfigured()) {
      // Mock mode — credentials not configured
      return { transactionId: `MTN-MOCK-${Date.now()}`, status: 'PENDING' };
    }

    const token = await this._getAccessToken();
    await axios.post(
      `${this.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount: String(amount),
        currency: this.currency,
        externalId: reference,
        payer: { partyIdType: 'MSISDN', partyId: phone },
        payerMessage: 'JenguPay Payment',
        payeeNote: reference,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Reference-Id': reference,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
          ...(this.callbackUrl && { 'X-Callback-Url': this.callbackUrl }),
        },
      }
    );
    return { transactionId: reference, status: 'PENDING' };
  }

  async getTransactionStatus(transactionId) {
    if (!this._isConfigured()) {
      return { status: 'SUCCESSFUL' };
    }

    const token = await this._getAccessToken();
    const response = await axios.get(
      `${this.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      }
    );
    return response.data;
  }
}

module.exports = new MTNProvider();
