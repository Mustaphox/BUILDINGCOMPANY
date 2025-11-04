require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || './data/sa3oudi.db';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// ensure folders
if (!fs.existsSync(path.dirname(DB_FILE))) fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// init db
const dbExists = fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
    process.exit(1);
  }
  // If DB didn't exist, initialize schema from SQL file (data/schema.sql)
  if (!dbExists) {
    try {
      const schemaPath = path.join(__dirname, 'data', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (execErr) => {
          if (execErr) console.error('Failed to initialize DB schema:', execErr);
          else console.log('Database schema initialized from data/schema.sql');
        });
      } else {
        console.warn('Schema file not found at', schemaPath, '— no schema was applied');
      }
    } catch (e) {
      console.error('Error reading/initializing schema:', e);
    }
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));
app.use(express.static(path.join(__dirname)));

// multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safe = file.originalname.replace(/[^a-zA-Z0-9\.\-\_\u0600-\u06FF]/g, '_');
    cb(null, `${unique}-${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// nodemailer transporter (configured via env)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Routes
app.get('/api/news', (req, res) => {
  db.all('SELECT * FROM news ORDER BY id DESC LIMIT 100', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/news', (req, res) => {
  const { title, content, image, url } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  const created_at = new Date().toISOString();
  db.run('INSERT INTO news (title, content, image, url, created_at) VALUES (?,?,?,?,?)', [title, content, image || null, url || null, created_at], function(err) {
    if (err) {
      console.error('DB insert news error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, title, content, image, url, created_at });
  });
});

// Update news item
app.put('/api/news/:id', (req, res) => {
  const id = req.params.id;
  const { title, content, image, url } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  db.run('UPDATE news SET title = ?, content = ?, image = ?, url = ? WHERE id = ?', [title, content, image || null, url || null, id], function(err) {
    if (err) {
      console.error('DB update news error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

app.delete('/api/news/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM news WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('DB delete news error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Job application endpoint
app.post('/api/apply', upload.single('cv'), (req, res) => {
  const { name, email, phone, position, message } = req.body;
  const cv = req.file;
  if (!name || !email || !cv) {
    return res.status(400).json({ error: 'name, email and cv are required' });
  }

  const created_at = new Date().toISOString();
  const cvPath = cv ? `/uploads/${path.basename(cv.path)}` : null;

  db.run('INSERT INTO applications (name, email, phone, position, message, cv_path, created_at) VALUES (?,?,?,?,?,?,?)',
    [name, email, phone || null, position || null, message || null, cvPath, created_at], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // send email if transporter configured
      if (transporter && process.env.RECEIVER_EMAIL) {
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: process.env.RECEIVER_EMAIL,
          subject: `New Job Application: ${name}`,
          text: `New application from ${name} (${email}).\nPhone: ${phone || '-'}\nPosition: ${position || '-'}\nMessage: ${message || '-'}\nCV: ${cvPath}`,
          attachments: [
            {
              filename: cv.originalname,
              path: cv.path
            }
          ]
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.error('Email error:', err);
        });
      }

      res.json({ success: true, id: this.lastID });
    });
});

// simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
