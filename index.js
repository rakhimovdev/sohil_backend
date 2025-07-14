const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const File = require('./models/File');  // <-- MUHIM!!! Modelni chaqirish

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB ulanish
const MONGO_URI = 'mongodb+srv://rahimovdev1:rakhimov_dev@sohil.sq8aanq.mongodb.net/?retryWrites=true&w=majority&appName=Sohil';

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB ulandi"))
  .catch(err => console.log("MongoDB ulanish xatosi:", err));

// Multer sozlash
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Fayl yuklash route
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log(req.file);
  const file = new File({
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
  await file.save();

  res.json(file);
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const img = await File.findByIdAndDelete(req.params.id);
    if (!img) {
      return res.status(404).send("File not found");
    }
    res.send(`File deleted: ${img.filename}`);
  } catch (err) {
    res.status(500).send("Error deleting file");
  }
});


// Barcha fayllarni olish
app.get('/files', async (req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

app.listen(5000, () => {
  console.log("Server 5000-portda ishlayapti");
});
