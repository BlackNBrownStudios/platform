const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const storeItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['border', 'theme', 'cardBack'],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
      unique: true,
    },
    previewImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    cssProperties: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
storeItemSchema.plugin(toJSON);
storeItemSchema.plugin(paginate);

/**
 * @typedef StoreItem
 */
const StoreItem = mongoose.model('StoreItem', storeItemSchema);

module.exports = StoreItem;
