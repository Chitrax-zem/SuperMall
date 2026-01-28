const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop reference is required'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'buy_one_get_one'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
    },
    terms: {
      type: String,
    },
    image: {
      type: String,
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

// Check if offer is currently valid
offerSchema.methods.isValid = function () {
  const now = new Date();
  return this.isActive && this.validFrom <= now && this.validUntil >= now;
};
offerSchema.index({ isActive: 1, validFrom: 1, validUntil: 1, createdAt: -1 });
offerSchema.index({ shop: 1, isActive: 1, validFrom: 1, validUntil: 1 });


module.exports = mongoose.model('Offer', offerSchema);
