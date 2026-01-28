const express = require('express');
const router = express.Router();
const {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
} = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');
const {
  shopValidation,
  idValidation,
  validate,
} = require('../middleware/validation');

router
  .route('/')
  .get(getAllShops)
  .post(protect, shopValidation, validate, createShop);

router
  .route('/:id')
  .get(idValidation, validate, getShopById)
  .put(protect, idValidation, shopValidation, validate, updateShop)
  .delete(protect, idValidation, validate, deleteShop);

module.exports = router;
