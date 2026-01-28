const express = require('express');
const router = express.Router();
const {
  createFloor,
  getAllFloors,
  getFloorById,
  updateFloor,
  deleteFloor,
} = require('../controllers/floorController');
const { protect } = require('../middleware/authMiddleware');
const { idValidation, validate } = require('../middleware/validation');

router.route('/').get(getAllFloors).post(protect, createFloor);

router
  .route('/:id')
  .get(idValidation, validate, getFloorById)
  .put(protect, idValidation, validate, updateFloor)
  .delete(protect, idValidation, validate, deleteFloor);

module.exports = router;
