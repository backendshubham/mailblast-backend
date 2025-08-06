const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { smtpEmail, smtpPass } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPass }
    });

    const veri = await transporter.verify();
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Incorrect email or password. Please check your SMTP credentials. If you\'re using Gmail and have 2-Step Verification enabled, use an App Password.' });
  }
});
module.exports = router;
