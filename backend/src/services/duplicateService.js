const Lead = require('../models/Lead');

const DUPLICATE_WINDOW_HOURS = 48;

/**
 * Detect if a client has submitted a similar lead recently.
 * Checks same clientId + service within the duplicate window.
 *
 * @param {string} clientId
 * @param {string} service
 * @returns {boolean} isDuplicate
 */
const detectDuplicate = async (clientId, service) => {
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000);

  const existing = await Lead.findOne({
    clientId,
    service,
    createdAt: { $gte: windowStart },
    status: { $nin: ['rejected'] },
  });

  return !!existing;
};

module.exports = { detectDuplicate };
