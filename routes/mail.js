const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
  // Read SMTP creds from request body
  const smtpEmail = req.body.smtpEmail;
  const smtpPass = req.body.smtpPass;
  const { email, message } = req.body;
  const file = req.files?.resume || null;

  if (!smtpEmail || !smtpPass) {
    return res.status(401).json({ status: 'Not Authenticated', error: 'Missing SMTP credentials' });
  }
  if (!email || !message) {
    return res.status(400).json({ status: 'Failed', error: 'Missing recipient or message.' });
  }

  let attachments = [];
  let uploadPath = '';

  try {
    if (file) {
      // Save file with unique name
      const uniqueName = `${Date.now()}-${file.name}`;
      uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);
      await file.mv(uploadPath);
      attachments.push({ filename: file.name, path: uploadPath });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPass }
    });

    // Support comma-separated string or array of emails
    const recipients = Array.isArray(email)
      ? email
      : email.split(',').map(e => e.trim()).filter(Boolean);
    const results = [];

    for (const recipient of recipients) {
      try {
        const info = await transporter.sendMail({
          from: smtpEmail,
          to: recipient,
          subject: 'Resume Submission',
          text: message,
          attachments,
        });

        results.push({ recipient, status: 'Sent', messageId: info.messageId });
      } catch (err) {
        results.push({ recipient, status: 'Failed', error: err.message });
      }
    }

    if (file && fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }

    res.json({ status: 'Completed', results });
  } catch (err) {
    if (file && fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath); // clean up if error occurred
    }
    res.status(500).json({ status: 'Failed', error: 'Incorrect email or password. Please check your SMTP credentials. If you\'re using Gmail and have 2-Step Verification enabled, use an App Password.' });
  }
});

module.exports = router;
