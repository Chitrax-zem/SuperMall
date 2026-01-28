const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Floor name is required'],
      trim: true,
    },
    floorNumber: {
      type: Number,
      required: [true, 'Floor number is required'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Floor', floorSchema);
