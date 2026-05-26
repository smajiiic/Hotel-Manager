const express = require('express');
const router = express.Router();
const authService = require('../services/AuthService');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  try {
    const resData = await authService.login(req, username, password);
    if (!resData.success) {
      return res.status(401).json(resData);
    }
    return res.json(resData);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const resData = await authService.logout(req);
    return res.json(resData);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
// Get current logged-in user
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      success: true,
      data: {
        username: req.session.username,
        role: req.session.role
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
});

module.exports = router;