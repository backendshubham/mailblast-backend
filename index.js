const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const mailRoutes = require('./routes/mail');
const authRoutes = require('./routes/auth');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use(cors({
  origin: '*',
  credentials: false 
}));

app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

app.use('/uploads', express.static(uploadDir));
app.use('/login', authRoutes);
app.use('/send', mailRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
