const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      featured,
      category,
      shop,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    if (shop) query.shop = shop;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 12, 1), 100);
    const skip = (pageNum - 1) * lim;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('shop', 'name location')
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Optional: fallback if featured empty on homepage
    if (featured === 'true' && products.length === 0) {
      const fallback = await Product.find({ isActive: true })
        .populate('category', 'name')
        .populate('shop', 'name location')
        .sort(sort)
        .limit(lim)
        .lean();

      return res.json({
        success: true,
        data: fallback,
        fallback: true,
        reason: 'no_featured_products',
        pagination: {
          total: fallback.length,
          page: 1,
          pages: 1,
          limit: lim,
        },
      });
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / lim),
        limit: lim,
      },
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('shop', 'name location contactInfo rating')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Get product by id error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

module.exports = router;
