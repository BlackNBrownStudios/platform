const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const cardSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    region: {
      type: String,
      trim: true,
    },
    locationName: {
      type: String,
      trim: true,
    },
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - GeoJSON format
        default: [0, 0], // Default coordinates to prevent validation errors
      },
    },
    locationMetadata: {
      type: {
        countryCode: String,
        country: String,
        state: String,
        city: String,
      },
      _id: false,
    },
    tags: [String],
    source: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
cardSchema.plugin(toJSON);
cardSchema.plugin(paginate);

// Add geospatial index for location-based queries
cardSchema.index({ locationCoordinates: '2dsphere' });

/**
 * Get cards by category
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>}
 */
cardSchema.statics.getByCategory = async function (category) {
  return this.find({ category });
};

/**
 * Get random cards for a game
 * @param {string} difficulty - The difficulty level
 * @param {number} count - The number of cards to return
 * @returns {Promise<Array>}
 */
cardSchema.statics.getRandomCards = async function (difficulty, count) {
  return this.aggregate([
    { $match: { difficulty, isVerified: true } },
    { $sample: { size: count } },
  ]);
};

/**
 * Get cards by geographical area
 * @param {number} lon - Longitude of center point
 * @param {number} lat - Latitude of center point
 * @param {number} radiusKm - Radius in kilometers
 * @param {number} limit - Maximum number of cards to return
 * @returns {Promise<Array>}
 */
cardSchema.statics.getByLocation = async function (lon, lat, radiusKm, limit = 20) {
  return this.find({
    locationCoordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        $maxDistance: radiusKm * 1000, // convert km to meters
      },
    },
  }).limit(limit);
};

/**
 * @typedef Card
 */
const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
