const AuditLog = require("../models/auditLogModel");

const auditLogger = async (req, res, next) => {
  // Only log operations that change data
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    
    // Listen for the response to finish so we don't log failed requests
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const log = new AuditLog({
            user: {
              // Pulls the username provided in your admin/staff controllers
              username: req.body.username || req.query.username || "System_User",
              role: req.path.includes('admin') ? 'Admin' : 'Staff'
            },
            action: `${req.method}_${req.path.replace('/api/', '').split('/')[1].toUpperCase()}`,
            method: req.method,
            endpoint: req.originalUrl,
            payload: req.body, 
            ip: req.ip
          });
          await log.save();
        } catch (err) {
          console.error("Audit Log Error:", err);
        }
      }
    });
  }
  next();
};

module.exports = auditLogger;