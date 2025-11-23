require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// إعداد الاتصال بقاعدة البيانات من متغيرات البيئة
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// الاتصال بقاعدة البيانات
db.connect((err) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    console.error('تفاصيل الخطأ:', err.message);
    console.error('تأكد من أن بيانات الاتصال صحيحة وأن قاعدة البيانات متاحة');
    return;
  }
  console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  
  // إنشاء جدول الملفات إذا لم يكن موجوداً
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_size BIGINT NOT NULL,
      mime_type VARCHAR(100),
      file_data LONGBLOB NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('❌ خطأ في إنشاء الجدول:', err);
      console.error('تفاصيل الخطأ:', err.message);
    } else {
      console.log('✅ جدول الملفات جاهز');
    }
  });
});

// إعداد multer لرفع الملفات (حد أقصى 16 ميجابايت)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16 ميجابايت
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.static('public'));
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// صفحة HTML الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// رفع ملف
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم اختيار ملف' });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  const query = 'INSERT INTO files (filename, original_name, file_size, mime_type, file_data) VALUES (?, ?, ?, ?, ?)';
  const filename = Date.now() + '-' + originalname;

  db.query(query, [filename, originalname, size, mimetype, buffer], (err, result) => {
    if (err) {
      console.error('خطأ في حفظ الملف:', err);
      return res.status(500).json({ error: 'فشل في حفظ الملف' });
    }

    res.json({
      message: 'تم رفع الملف بنجاح',
      fileId: result.insertId,
      filename: originalname,
      size: size
    });
  });
});

// عرض قائمة الملفات
app.get('/files', (req, res) => {
  const query = 'SELECT id, original_name, file_size, mime_type, upload_date FROM files ORDER BY upload_date DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('خطأ في جلب الملفات:', err);
      return res.status(500).json({ error: 'فشل في جلب الملفات' });
    }
    res.json(results);
  });
});

// تحميل ملف
app.get('/download/:id', (req, res) => {
  const query = 'SELECT original_name, mime_type, file_data FROM files WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('خطأ في جلب الملف:', err);
      return res.status(500).json({ error: 'فشل في جلب الملف' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }

    const file = results[0];
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.send(file.file_data);
  });
});

// حذف ملف
app.delete('/delete/:id', (req, res) => {
  const query = 'DELETE FROM files WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('خطأ في حذف الملف:', err);
      return res.status(500).json({ error: 'فشل في حذف الملف' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }

    res.json({ message: 'تم حذف الملف بنجاح' });
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('خطأ في السيرفر:', err);
  res.status(500).json({ error: 'حدث خطأ في السيرفر', details: err.message });
});

// تشغيل الخادم
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${port}`);
  console.log(`📁 البيئة: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚠️  تأكد من أن قاعدة البيانات متصلة`);
});
