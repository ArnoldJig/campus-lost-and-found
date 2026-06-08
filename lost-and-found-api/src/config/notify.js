'use strict';

const pool = require('./db');
const { sendMatchNotification } = require('./mailer');

async function createNotification(userId, message, type) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, message, is_read)
       VALUES ($1, $2, FALSE)`,
      [userId, message]
    );
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

async function notifyItemReported(userId, itemTitle, itemType) {
  const message = `✅ Your ${itemType} item "${itemTitle}" has been reported successfully. You will be notified when a potential match is found.`;
  await createNotification(userId, message);
}

async function notifyMatchFound(lostItem, foundItem) {
  try {
    const lostOwner = await pool.query(
      `SELECT u.id, u.email, u.full_name FROM items i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
      [lostItem.id]
    );
    const foundOwner = await pool.query(
      `SELECT u.id, u.email, u.full_name FROM items i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
      [foundItem.id]
    );

    if (lostOwner.rows.length > 0) {
      const user = lostOwner.rows[0];
      await createNotification(
        user.id,
        `🔍 Potential match found for your lost item "${lostItem.title}"! Check it out and message the finder.`
      );
      await sendMatchNotification(user.email, user.full_name, lostItem.title, foundItem.title, foundItem.id);
    }

    if (foundOwner.rows.length > 0) {
      const user = foundOwner.rows[0];
      await createNotification(
        user.id,
        `🔍 Potential match found for your found item "${foundItem.title}"! Someone may be looking for it.`
      );
      await sendMatchNotification(user.email, user.full_name, foundItem.title, lostItem.title, lostItem.id);
    }
  } catch (err) {
    console.error('Match notification error:', err.message);
  }
}

async function notifyNewMessage(receiverId, senderName, matchId) {
  try {
    const userResult = await pool.query(
      `SELECT email, full_name FROM users WHERE id = $1`,
      [receiverId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      await createNotification(
        receiverId,
        `💬 New message from ${senderName}. Click to view your conversation.`
      );

      await sendMessageNotification(user.email, user.full_name, senderName);
    }
  } catch (err) {
    console.error('Message notification error:', err.message);
  }
}

module.exports = { notifyItemReported, notifyMatchFound, notifyNewMessage };