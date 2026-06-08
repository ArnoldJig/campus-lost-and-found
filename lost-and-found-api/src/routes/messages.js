'use strict';

const express = require('express');
const multer = require('multer');
const cloudinaryPkg = require('cloudinary');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { notifyNewMessage } = require('../config/notify');

const router = express.Router();
const cloudinary = cloudinaryPkg.v2;
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('image'), async function(req, res) {
  const { match_id, receiver_id, content } = req.body;

  if (!match_id || !receiver_id) {
    return res.status(400).json({ error: 'match_id and receiver_id are required.' });
  }

  try {
    let image_url = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'lost-and-found/messages' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      image_url = uploadResult.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO messages (match_id, sender_id, receiver_id, content, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [match_id, req.user.id, receiver_id, content || null, image_url]
    );

    const senderResult = await pool.query(
      `SELECT full_name FROM users WHERE id = $1`,
      [req.user.id]
    );
    const senderName = senderResult.rows[0]?.full_name || 'Someone';

    await notifyNewMessage(receiver_id, senderName, match_id);

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:match_id', authMiddleware, async function(req, res) {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.match_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.match_id]
    );

    await pool.query(
      `UPDATE messages SET is_read = TRUE
       WHERE match_id = $1 AND receiver_id = $2`,
      [req.params.match_id, req.user.id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;