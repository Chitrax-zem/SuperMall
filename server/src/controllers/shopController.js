 const Shop = require('../models/Shop');
const logger = require('../utils/logger');

// @desc    Create shop
// @route   POST /api/shops
// @access  Private (Admin)
exports.createShop = async (req, res, next) => {
  try {
    const shop = await Shop.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop,
    });
  } catch (error) {
    logger.error('Create shop error:', error);
    next(error);
  }
};

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
// controllers/shopController.js (excerpt)
exports.getAllShops = async (req, res) => {
  try {
    const { floor, category, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    if (floor) query['location.floor'] = floor;
    if (category) query.categories = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * lim;

    const [shops, total] = await Promise.all([
      Shop.find(query)
        .populate('location.floor', 'name floorNumber')
        .populate('categories', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim),
      Shop.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: shops,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / lim),
        limit: lim,
      },
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message,
    });
  }
};


// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
exports.getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('location.floor', 'name floorNumber')
      .populate('categories', 'name description');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    logger.error('Get shop by ID error:', error);
    next(error);
  }
};

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Admin)
exports.updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop,
    });
  } catch (error) {
    logger.error('Update shop error:', error);
    next(error);
  }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (Admin)
exports.deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    logger.error('Delete shop error:', error);
    next(error);
  }
};
