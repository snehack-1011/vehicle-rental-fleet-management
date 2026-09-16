const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, userId = null, details = {}) => {
  try {
    // Sanitize details to never include sensitive data
    const safeDetails = { ...details };
    delete safeDetails.password;
    delete safeDetails.token;

    const logEntry = new AuditLog({
      userId: userId,
      action: action,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: safeDetails
    });

    await logEntry.save();
    console.log(`[AUDIT LOG] ${action} - User: ${userId || 'Anonymous'}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = { logAudit };
