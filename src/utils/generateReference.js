const crypto = require('crypto');

const generateReference = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JGP-${timestamp}-${random}`;
};

module.exports = generateReference;
