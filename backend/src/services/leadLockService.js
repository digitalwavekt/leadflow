const Lead = require('../models/Lead');
const { emitLeadUnlocked } = require('../config/socket');

/**
 * Called by cron every 30 seconds.
 * Finds all leads where lockExpiry has passed and unlocks them.
 */
const unlockExpiredLeads = async () => {
  const now = new Date();

  const expiredLeads = await Lead.find({
    status: 'locked',
    lockExpiry: { $lte: now },
  }).select('_id');

  if (expiredLeads.length === 0) return;

  const ids = expiredLeads.map((l) => l._id);

  await Lead.updateMany(
    { _id: { $in: ids } },
    { $set: { status: 'open', lockedBy: null, lockExpiry: null } }
  );

  // Broadcast unlock for each expired lead
  ids.forEach((id) => emitLeadUnlocked(id.toString()));

  console.log(`🔓 Auto-unlocked ${ids.length} expired lead(s)`);
};

module.exports = { unlockExpiredLeads };
