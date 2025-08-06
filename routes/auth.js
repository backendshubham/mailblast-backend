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
    console.log("veri =>", veri)
    res.json({ success: true });
  } catch (err) {
    console.log('err ==>', err)
    res.status(401).json({ success: false, error: err.message });
  }
});
module.exports = router;
