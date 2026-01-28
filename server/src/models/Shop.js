const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      name: {
        type: String,
        required: [true, 'Owner name is required'],
      },
      email: {
        type: String,
        required: [true, 'Owner email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
    },
    location: {
      floor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Floor',
        required: [true, 'Floor is required'],
      },
      shopNumber: {
        type: String,
        required: [true, 'Shop number is required'],
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
      },
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shop', shopSchema);
