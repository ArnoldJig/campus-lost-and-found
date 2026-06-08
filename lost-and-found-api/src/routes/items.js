'use strict';

const express = require('express');
const multer = require('multer');
const cloudinaryPkg = require('cloudinary');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { notifyItemReported, notifyMatchFound } = require('../config/notify');

const router = express.Router();
const cloudinary = cloudinaryPkg.v2;
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('image'), async function(req, res) {
  const { type, title, description, category_id, color, location } = req.body;

  if (!type || !title) {
    return res.status(400).json({ error: 'Type and title are required.' });
  }

  try {
    let image_url = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'lost-and-found' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      image_url = uploadResult.secure_url;
    }

    let resolvedCategoryId = null;
    if (category_id) {
      const catResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1 OR id::text = $1',
        [category_id]
      );
      if (catResult.rows.length > 0) {
        resolvedCategoryId = catResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO items (user_id, type, title, description, category_id, color, location, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, type, title, description, resolvedCategoryId, color, location, image_url]
    );

    const newItem = result.rows[0];

    await notifyItemReported(req.user.id, title, type);

    if (image_url && newItem.id) {
      try {
        const formData = new FormData();
        formData.append('item_id', newItem.id);
        formData.append('image', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        await fetch('http://127.0.0.1:5001/embed', {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders(),
        });
      } catch (aiErr) {
        console.error('AI embedding error:', aiErr.message);
      }
    }

    res.status(201).json({ item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/', async function(req, res) {
  const { type, category_id } = req.query;
  try {
    let query = `
      SELECT i.*, u.full_name as reporter_name, c.name as category_name
      FROM items i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'open'
    `;
    const params = [];
    if (type) { params.push(type); query += ` AND i.type = $${params.length}`; }
    if (category_id) { params.push(category_id); query += ` AND i.category_id = $${params.length}`; }
    query += ' ORDER BY i.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id', async function(req, res) {
  try {
    const result = await pool.query(
      `SELECT i.*, u.full_name as reporter_name, c.name as category_name
       FROM items i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found.' });
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id/matches', async function(req, res) {
  try {
    const response = await fetch('http://127.0.0.1:5001/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: req.params.id })
    });

    const data = await response.json();
    if (data.error) return res.json({ matches: [] });

    const matches = data.matches;

    if (matches.length > 0) {
      try {
        const itemResult = await pool.query(
          `SELECT i.id, i.title, i.type, u.email, u.full_name, u.id as user_id
           FROM items i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
          [req.params.id]
        );

        if (itemResult.rows.length > 0) {
          const item = itemResult.rows[0];
          const topMatch = matches[0];

          if (topMatch.confidence_score >= 0.5) {
            const lostItemId = item.type === 'lost' ? req.params.id : topMatch.item_id;
            const foundItemId = item.type === 'found' ? req.params.id : topMatch.item_id;

            const existingMatch = await pool.query(
              `SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2`,
              [lostItemId, foundItemId]
            );

            let matchId;
            if (existingMatch.rows.length === 0) {
              const savedMatch = await pool.query(
                `INSERT INTO matches (lost_item_id, found_item_id, image_score, text_score, confidence_score)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [lostItemId, foundItemId, topMatch.image_score, topMatch.text_score, topMatch.confidence_score]
              );
              matchId = savedMatch.rows[0].id;

              const lostItemResult = await pool.query(`SELECT id, title FROM items WHERE id = $1`, [lostItemId]);
              const foundItemResult = await pool.query(`SELECT id, title FROM items WHERE id = $1`, [foundItemId]);

              if (lostItemResult.rows.length > 0 && foundItemResult.rows.length > 0) {
                await notifyMatchFound(lostItemResult.rows[0], foundItemResult.rows[0]);
              }
            } else {
              matchId = existingMatch.rows[0].id;
            }

            matches[0].match_id = matchId;
          }
        }
      } catch (notifyErr) {
        console.error('Notification error:', notifyErr.message);
      }
    }

    for (const match of matches) {
      const ownerResult = await pool.query(
        `SELECT user_id FROM items WHERE id = $1`,
        [match.item_id]
      );
      if (ownerResult.rows.length > 0) {
        match.receiver_id = ownerResult.rows[0].user_id;
      }
    }

    res.json({ matches });
  } catch (err) {
    console.error('Match error:', err.message);
    res.json({ matches: [] });
  }
});

module.exports = router;