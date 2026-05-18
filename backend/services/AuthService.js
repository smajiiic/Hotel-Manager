const User = require('../models/User');
const bcrypt = require('bcrypt');

class AuthService {
  async login(req, username, password) {
    const user = await User.findOne({ username });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return { success: false, error: 'Invalid credentials' };
    }

    // save to session
    req.session.userId = user._id;
    req.session.role = user.role;

    return { 
      success: true, 
      data: { username: user.username, role: user.role } 
    };
  }

  async logout(req) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          resolve({ success: false, error: 'Session destroy failed' });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

module.exports = new AuthService();