const db = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');

// Helper to map DB row to public user object
const publicUser = (row) => ({
  id: row.id,
  profile_image: row.profile_image,
  employee_id: row.employee_id,
  full_name: row.full_name,
  email: row.email,
  phone: row.phone,
  username: row.username,
  role: row.role,
  department: row.department,
  status: row.status,
  joining_date: row.joining_date,
  last_login: row.last_login,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

exports.getAllUsers = (req, res) => {
  const sql = `SELECT id, profile_image, employee_id, full_name, email, phone, username, role, department, status, joining_date, last_login, created_at, updated_at FROM users`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const data = results.map(publicUser);
    res.json({ success: true, count: data.length, data });
  });
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id, profile_image, employee_id, full_name, email, phone, username, role, department, status, joining_date, last_login, created_at, updated_at FROM users WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: publicUser(results[0]) });
  });
};

exports.createUser = async (req, res) => {
  try {
    const { employee_id, full_name, email, phone, username, password, role, department, status, joining_date } = req.body;
    const profile_image = req.file ? path.join('uploads', 'users', req.file.filename) : null;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (profile_image, employee_id, full_name, email, phone, username, password, role, department, status, joining_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    db.query(sql, [profile_image, employee_id, full_name, email, phone, username, hashed, role || 'Viewer', department || '', status || 'Active', joining_date || null], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.status(201).json({ success: true, message: 'User created', userId: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, full_name, email, phone, username, password, role, department, status, joining_date } = req.body;
    const profile_image = req.file ? path.join('uploads', 'users', req.file.filename) : null;

    const fields = [];
    const params = [];
    if (profile_image) { fields.push('profile_image = ?'); params.push(profile_image); }
    if (employee_id !== undefined) { fields.push('employee_id = ?'); params.push(employee_id); }
    if (full_name !== undefined) { fields.push('full_name = ?'); params.push(full_name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (department !== undefined) { fields.push('department = ?'); params.push(department); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (joining_date !== undefined) { fields.push('joining_date = ?'); params.push(joining_date); }
    if (password) { const hashed = await bcrypt.hash(password, 10); fields.push('password = ?'); params.push(hashed); }

    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    db.query(sql, params, (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: 'User updated' });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM users WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'User deleted' });
  });
};
