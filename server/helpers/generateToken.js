const crypto = require('crypto');
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');
module.exports = generateVerificationToken;