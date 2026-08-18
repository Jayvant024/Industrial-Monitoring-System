const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// =========================
// LOGIN
// =========================
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const sql = `
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.password,
      u.phone,
      u.profile_image,
      u.role_id,
      r.role_name,
      u.department_id,
      d.department_name,
      u.status,
      u.last_login,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN roles r
      ON u.role_id = r.role_id
    LEFT JOIN departments d
      ON u.department_id = d.department_id
    WHERE u.email = ?
    LIMIT 1
  `;

  db.query(sql, [email.trim()], async (err, results) => {

    if (err) {
      console.error('Login database error:', err);

      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = results[0];

    // Check account status
    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'This user account is inactive'
      });
    }

    // Compare password with bcrypt hash
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // JWT payload
    const payload = {
      id: user.user_id,
      email: user.email,
      role: user.role_name,
      role_id: user.role_id,
      department_id: user.department_id
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '8h'
      }
    );

    // Update last login
    db.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id],
      (updateErr) => {
        if (updateErr) {
          console.error(
            'Failed to update last_login:',
            updateErr.message
          );
        }
      }
    );

    // Remove password before sending response
    delete user.password;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  });
};


// =========================
// LOGOUT
// =========================
exports.logout = (req, res) => {

  res.json({
    success: true,
    message: 'Logged out successfully'
  });

};


// =========================
// GET CURRENT USER
// =========================
exports.me = (req, res) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const sql = `
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.profile_image,
      u.role_id,
      r.role_name,
      u.department_id,
      d.department_name,
      u.status,
      u.last_login,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN roles r
      ON u.role_id = r.role_id
    LEFT JOIN departments d
      ON u.department_id = d.department_id
    WHERE u.user_id = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [req.user.id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: results[0]
      });

    }
  );

};