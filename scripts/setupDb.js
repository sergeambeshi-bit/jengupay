require('dotenv').config();
const pool = require('../src/config/db');

// Base table creation (no-op if it already exists)
const createTable = `
  CREATE TABLE IF NOT EXISTS payments (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    reference     TEXT           UNIQUE NOT NULL,
    amount        NUMERIC(12, 2) NOT NULL,
    provider      TEXT           NOT NULL,
    phone         TEXT,
    status        TEXT           NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
  );
`;

// Idempotent column additions for schema evolution
const migrations = [
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_tx_id TEXT`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`,
  `CREATE INDEX IF NOT EXISTS idx_payments_reference  ON payments (reference)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments (status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_provider   ON payments (provider)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC)`,
];

async function setup() {
  try {
    console.log('Connecting to database...');
    await pool.query(createTable);
    for (const sql of migrations) {
      await pool.query(sql);
    }
    console.log('✔ payments table ready');
    process.exit(0);
  } catch (err) {
    console.error('✘ Database setup failed:', err.message);
    process.exit(1);
  }
}

setup();
