const Floor = require('../models/Floor');
const logger = require('../utils/logger');

// @desc    Create floor
// @route   POST /api/floors
// @access  Private (Admin)
exports.createFloor = async (req, res, next) => {
  try {
    const floor = await Floor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Floor created successfully',
      data: floor,
    });
  } catch (error) {
    logger.error('Create floor error:', error);
    next(error);
  }
};

// @desc    Get all floors
// @route   GET /api/floors
// @access  Public
exports.getAllFloors = async (req, res, next) => {
  try {
    const floors = await Floor.find({ isActive: true }).sort({ floorNumber: 1 });

    res.status(200).json({
      success: true,
      data: floors,
    });
  } catch (error) {
    logger.error('Get floors error:', error);
    next(error);
  }
};

// @desc    Get floor by ID
// @route   GET /api/floors/:id
// @access  Public
exports.getFloorById = async (req, res, next) => {
  try {
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: floor,
    });
  } catch (error) {
    logger.error('Get floor by ID error:', error);
    next(error);
  }
};

// @desc    Update floor
// @route   PUT /api/floors/:id
// @access  Private (Admin)
exports.updateFloor = async (req, res, next) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Floor updated successfully',
      data: floor,
    });
  } catch (error) {
    logger.error('Update floor error:', error);
    next(error);
  }
};

// @desc    Delete floor
// @route   DELETE /api/floors/:id
// @access  Private (Admin)
exports.deleteFloor = async (req, res, next) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Floor deleted successfully',
    });
  } catch (error) {
    logger.error('Delete floor error:', error);
    next(error);
  }
};
