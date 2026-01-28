const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// GET /api/offers
router.get('/', async (req, res) => {
  try {
    const { active, shop, page = 1, limit = 10 } = req.query;

    const query = {};
    if (shop) query.shop = shop;

    if (active === 'true') {
      const now = new Date();
      query.$and = [
        { isActive: true },
        {
          $or: [
            { $and: [{ validFrom: { $lte: now } }, { validUntil: { $gte: now } }] },
            { validFrom: { $exists: false } },
            { validUntil: { $exists: false } },
          ],
        },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * lim;

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('shop', 'name location')
        .populate('applicableProducts', 'name price images')
        .populate('applicableCategories', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Offer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: offers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / lim),
        limit: lim,
      },
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message,
    });
  }
});

module.exports = router;
