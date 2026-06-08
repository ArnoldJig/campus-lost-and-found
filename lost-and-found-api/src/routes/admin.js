'use strict';

const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

router.get('/items', authMiddleware, adminOnly, async function(req, res) {
  try {
    const result = await pool.query(`
      SELECT i.*, u.full_name as reporter_name, u.email as reporter_email,
             c.name as category_name
      FROM items i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/matches', authMiddleware, adminOnly, async function(req, res) {
  try {
    const result = await pool.query(`
      SELECT m.*,
             li.title as lost_title, li.image_url as lost_image,
             fi.title as found_title, fi.image_url as found_image,
             lu.full_name as lost_reporter, fu.full_name as found_reporter
      FROM matches m
      JOIN items li ON m.lost_item_id = li.id
      JOIN items fi ON m.found_item_id = fi.id
      JOIN users lu ON li.user_id = lu.id
      JOIN users fu ON fi.user_id = fu.id
      ORDER BY m.created_at DESC
    `);
    res.json({ matches: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/users', authMiddleware, adminOnly, async function(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, created_at FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.patch('/items/:id/status', authMiddleware, adminOnly, async function(req, res) {
  const { status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE items SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/items/:id', authMiddleware, adminOnly, async function(req, res) {
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;