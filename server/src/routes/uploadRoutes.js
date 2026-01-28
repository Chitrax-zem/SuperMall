const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

const router = express.Router();

// storage per entity
function storageFor(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(__dirname, '..', '..', 'uploads', folder, String(req.params.id));
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  });
}
const uploadProduct = multer({ storage: storageFor('product') });
const uploadShop = multer({ storage: storageFor('shop') });

// POST /api/uploads/product/:id
router.post('/product/:id', uploadProduct.array('images', 5), async (req, res) => {
  try {
    const urls = req.files.map((f) => `/uploads/product/${req.params.id}/${path.basename(f.path)}`);
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });

    doc.images = urls.concat(doc.images || []);
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Upload product images error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// POST /api/uploads/shop/:id
router.post('/shop/:id', uploadShop.array('images', 5), async (req, res) => {
  try {
    const urls = req.files.map((f) => `/uploads/shop/${req.params.id}/${path.basename(f.path)}`);
    const doc = await Shop.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Shop not found' });

    doc.images = urls.concat(doc.images || []);
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Upload shop images error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
