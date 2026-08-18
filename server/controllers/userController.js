const db = require('../config/db');
const bcrypt = require('bcrypt');

const normalizeStatus = (value) => (value === 'Inactive' ? 'Inactive' : 'Active');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

const baseUserSelect = `
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
  LEFT JOIN roles r ON u.role_id = r.role_id
  LEFT JOIN departments d ON u.department_id = d.department_id
`;

exports.getRoles = (req, res) => {
  const sql = 'SELECT role_id, role_name FROM roles ORDER BY role_id ASC';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, data: results });
  });
};

exports.getDepartments = (req, res) => {
  const sql = 'SELECT department_id, department_name FROM departments ORDER BY department_id ASC';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, data: results });
  });
};

exports.getAllUsers = (req, res) => {
  const { search = '', role_id, department_id, status } = req.query;
  const clauses = [];
  const params = [];

  if (search && String(search).trim()) {
    const value = `%${String(search).trim()}%`;
    clauses.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    params.push(value, value, value);
  }

  if (role_id && role_id !== 'All' && role_id !== 'all') {
    clauses.push('u.role_id = ?');
    params.push(Number(role_id));
  }

  if (department_id && department_id !== 'All' && department_id !== 'all') {
    clauses.push('u.department_id = ?');
    params.push(Number(department_id));
  }

  if (status && status !== 'All' && status !== 'all') {
    clauses.push('u.status = ?');
    params.push(status);
  }

  let sql = baseUserSelect;
  if (clauses.length) {
    sql += ` WHERE ${clauses.join(' AND ')}`;
  }

  sql += ' ORDER BY u.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  });
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  const sql = `${baseUserSelect} WHERE u.user_id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: results[0] });
  });
};

exports.createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role_id,
      department_id,
      status,
    } = req.body;

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (!role_id) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const normalizedStatus = normalizeStatus(status);
    const safeRoleId = Number(role_id);
    const safeDepartmentId = department_id && department_id !== '' ? Number(department_id) : null;

    const existingEmailSql = 'SELECT user_id FROM users WHERE email = ? LIMIT 1';
    const existingEmail = await new Promise((resolve, reject) => {
      db.query(existingEmailSql, [String(email).trim()], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });

    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const profileImage = req.file ? `uploads/users/${req.file.filename}` : null;

    const sql = `
      INSERT INTO users (
        full_name,
        email,
        password,
        phone,
        profile_image,
        role_id,
        department_id,
        status,
        last_login,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())
    `;

    db.query(
      sql,
      [
        String(full_name).trim(),
        String(email).trim(),
        hashedPassword,
        phone && String(phone).trim() ? String(phone).trim() : null,
        profileImage,
        safeRoleId,
        safeDepartmentId,
        normalizedStatus,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          userId: result.insertId,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role_id, department_id, status } = req.body;

    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      if (!String(full_name).trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required' });
      }
      updates.push('full_name = ?');
      values.push(String(full_name).trim());
    }

    if (email !== undefined) {
      if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
      }

      const existingEmail = await new Promise((resolve, reject) => {
        db.query('SELECT user_id FROM users WHERE email = ? AND user_id != ? LIMIT 1', [String(email).trim(), id], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        });
      });

      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      updates.push('email = ?');
      values.push(String(email).trim());
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone && String(phone).trim() ? String(phone).trim() : null);
    }

    if (role_id !== undefined) {
      if (!role_id) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }
      updates.push('role_id = ?');
      values.push(Number(role_id));
    }

    if (department_id !== undefined) {
      updates.push('department_id = ?');
      values.push(department_id && department_id !== '' ? Number(department_id) : null);
    }

    if (status !== undefined) {
      const safeStatus = normalizeStatus(status);
      updates.push('status = ?');
      values.push(safeStatus);
    }

    if (req.file) {
      updates.push('profile_image = ?');
      values.push(`uploads/users/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`;

    db.query(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      res.json({ success: true, message: 'User updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE user_id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  });
};
