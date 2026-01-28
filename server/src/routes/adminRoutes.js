const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  adminRegisterValidation,
  adminLoginValidation,
  validate,
} = require('../middleware/validation');

router.post('/register', adminRegisterValidation, validate, register);
router.post('/login', adminLoginValidation, validate, login);

// Use the admin protect middleware here
router.get('/profile', protectAdmin, getProfile);

module.exports = router;
