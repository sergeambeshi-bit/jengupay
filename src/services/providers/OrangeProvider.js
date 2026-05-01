const axios = require('axios');

class OrangeProvider {
  constructor() {
    this.baseUrl = process.env.ORANGE_API_URL || 'https://api.orange.com/orange-money-webpay/cm/v1';
    this.merchantKey = process.env.ORANGE_MERCHANT_KEY;
    this.clientId = process.env.ORANGE_CLIENT_ID;
    this.clientSecret = process.env.ORANGE_CLIENT_SECRET;
    this.notifUrl = process.env.ORANGE_NOTIF_URL;
    this.returnUrl = process.env.ORANGE_RETURN_URL;
    this.cancelUrl = process.env.ORANGE_CANCEL_URL;
    this.currency = process.env.ORANGE_CURRENCY || 'XAF';
  }

  _isConfigured() {
    return !!(this.merchantKey && this.clientId && this.clientSecret);
  }

  async _getAccessToken() {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(
      'https://api.orange.com/oauth/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  }

  async requestPayment({ amount, phone, reference }) {
    if (!this._isConfigured()) {
      // Mock mode — credentials not configured
      return { payToken: `OM-MOCK-${Date.now()}`, status: 'PENDING' };
    }

    const token = await this._getAccessToken();
    const response = await axios.post(
      `${this.baseUrl}/webpayment`,
      {
        merchant_key: this.merchantKey,
        currency: this.currency,
        order_id: reference,
        amount: String(amount),
        return_url: this.returnUrl,
        cancel_url: this.cancelUrl,
        notif_url: this.notifUrl,
        lang: 'en',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      payToken: response.data.pay_token,
      paymentUrl: response.data.payment_url,
      status: 'PENDING',
    };
  }

  async getTransactionStatus(payToken) {
    if (!this._isConfigured()) {
      return { status: 'SUCCESS' };
    }

    const token = await this._getAccessToken();
    const response = await axios.get(`${this.baseUrl}/webpayment/${payToken}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant_key: this.merchantKey,
      },
    });
    return response.data;
  }
}

module.exports = new OrangeProvider();
