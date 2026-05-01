const pool = require('../config/db');

const Payment = {
  async create({ reference, amount, provider, phone = null, status = 'pending', providerTxId = null, metadata = null }) {
    const result = await pool.query(
      `INSERT INTO payments (reference, amount, provider, phone, status, provider_tx_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [reference, amount, provider, phone, status, providerTxId, metadata ? JSON.stringify(metadata) : null]
    );
    return result.rows[0];
  },

  async findByReference(reference) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE reference = $1',
      [reference]
    );
    return result.rows[0] || null;
  },

  async updateStatus(reference, status, providerTxId = null) {
    const result = await pool.query(
      `UPDATE payments
       SET status = $1, provider_tx_id = COALESCE($2, provider_tx_id), updated_at = NOW()
       WHERE reference = $3
       RETURNING *`,
      [status, providerTxId, reference]
    );
    return result.rows[0] || null;
  },

  async findAll({ limit = 50, offset = 0 } = {}) {
    const result = await pool.query(
      'SELECT * FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },
};

module.exports = Payment;
