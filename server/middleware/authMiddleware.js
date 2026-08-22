const jwt = require('jsonwebtoken');


// ==========================================
// AUTHENTICATE USER
// ==========================================
exports.authenticate = (req, res, next) => {

  const header =
    req.headers['authorization'] ||
    req.headers['Authorization'];

  // No Authorization header
  if (!header) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Extract token
  const parts = header.split(' ');

  const token =
    parts.length === 2
      ? parts[1]
      : parts[0];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Verify JWT
  jwt.verify(
  token,
  process.env.JWT_SECRET,
    (err, decoded) => {

      if (err) {
        console.error('JWT verification error:', err.message);

        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Store decoded user information
      req.user = decoded;

      next();
    }
  );
};


// ==========================================
// AUTHORIZE USER ROLE
// ==========================================
exports.authorize = (roles = []) => (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Convert single role to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  /*
    New JWT contains role_id.

    Example:
    {
      user_id: 1,
      full_name: "Admin User",
      email: "admin@gmail.com",
      role_id: 1,
      department_id: 1
    }
  */

  if (roles.length) {

    const userRoleId = Number(req.user.role_id);

    const allowedRoleIds = roles.map(role => {

      // If number was provided
      if (!isNaN(Number(role))) {
        return Number(role);
      }

      // Role names
      const roleMap = {
        Admin: 1,
        Supervisor: 2,
        Operator: 3,
        Viewer: 4
      };

      return roleMap[role];
    });

    if (!allowedRoleIds.includes(userRoleId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
  }

  next();
};