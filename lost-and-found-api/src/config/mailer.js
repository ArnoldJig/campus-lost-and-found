'use strict';

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMatchNotification(toEmail, toName, itemTitle, matchTitle, matchId) {
  const mailOptions = {
    from: `"CampusFind" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Potential match found for: ${itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">◎ CampusFind</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1F4E79;">Good news, ${toName}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We found a potential match for your item <strong>"${itemTitle}"</strong>.
          </p>
          <p style="color: #555; font-size: 16px;">
            Matching item: <strong>"${matchTitle}"</strong>
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:3000/items/${matchId}"
               style="background: linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%); color: #ffffff;
                      padding: 14px 28px; border-radius: 8px; text-decoration: none;
                      font-size: 16px; font-weight: bold;">
              View Match
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            If this is not your item, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

async function sendMessageNotification(toEmail, toName, senderName) {
  const mailOptions = {
    from: `"CampusFind" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `New message from ${senderName} on CampusFind`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">◎ CampusFind</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1F4E79;">Hi ${toName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You have a new message from <strong>${senderName}</strong> regarding a matched item on CampusFind.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:3000/"
               style="background: linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%); color: #ffffff;
                      padding: 14px 28px; border-radius: 8px; text-decoration: none;
                      font-size: 16px; font-weight: bold;">
              View Message
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            Log in to CampusFind to reply.
          </p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

module.exports = { sendMatchNotification, sendMessageNotification };