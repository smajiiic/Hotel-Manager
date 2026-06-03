// Auth / role middleware. Reads identity from the express-session cookie that
// AuthService.login() populates (req.session.userId, req.session.role).
//
// requireAuth      — rejects anyone without a session (401).
// requireRole(...) — rejects authenticated users whose role isn't allowed (403).
//
// All responses keep the { success, error } envelope the frontend expects.

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ success: false, error: 'Not authenticated' });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden — requires role: ${roles.join(' or ')}`,
      });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
