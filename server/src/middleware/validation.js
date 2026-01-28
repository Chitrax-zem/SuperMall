const { body, param, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Admin validation rules
exports.adminRegisterValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

exports.adminLoginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Shop validation rules
exports.shopValidation = [
  body('name').trim().notEmpty().withMessage('Shop name is required'),
  body('owner.name').trim().notEmpty().withMessage('Owner name is required'),
  body('owner.email').isEmail().withMessage('Valid owner email is required'),
  body('location.floor').notEmpty().withMessage('Floor is required'),
  body('location.shopNumber').notEmpty().withMessage('Shop number is required'),
];

// Product validation rules
exports.productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('shop').notEmpty().withMessage('Shop reference is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
];

// Offer validation rules
exports.offerValidation = [
  body('title').trim().notEmpty().withMessage('Offer title is required'),
  body('shop').notEmpty().withMessage('Shop reference is required'),
  body('discountType')
    .isIn(['percentage', 'fixed', 'buy_one_get_one'])
    .withMessage('Invalid discount type'),
  body('discountValue').isNumeric().withMessage('Discount value must be a number'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
];

// ID validation
exports.idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];
