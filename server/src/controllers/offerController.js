const Offer = require('../models/Offer');
const logger = require('../utils/logger');

// @desc    Create offer
// @route   POST /api/offers
// @access  Private (Admin)
exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer,
    });
  } catch (error) {
    logger.error('Create offer error:', error);
    next(error);
  }
};

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
exports.getAllOffers = async (req, res, next) => {
  try {
    const { shop, active, page = 1, limit = 10 } = req.query;

    const query = {};
    if (shop) query.shop = shop;
    if (active === 'true') {
      const now = new Date();
      query.isActive = true;
      query.validFrom = { $lte: now };
      query.validUntil = { $gte: now };
    }

    const offers = await Offer.find(query)
      .populate('shop', 'name location')
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1     });

    const count = await Offer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: offers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Get offers error:', error);
    next(error);
  }
};

// @desc    Get offer by ID
// @route   GET /api/offers/:id
// @access  Public
exports.getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('shop', 'name location contactInfo')
      .populate('applicableProducts', 'name price images')
      .populate('applicableCategories', 'name description');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    logger.error('Get offer by ID error:', error);
    next(error);
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (Admin)
exports.updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: offer,
    });
  } catch (error) {
    logger.error('Update offer error:', error);
    next(error);
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (Admin)
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    logger.error('Delete offer error:', error);
    next(error);
  }
};

