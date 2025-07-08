/**
 * Historical Event Model
 * MongoDB schema and model for historical events
 */
const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

// Schema for event sources
const eventSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    retrievalDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main schema for historical events
const historicalEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    day: {
      type: Number,
      min: 1,
      max: 31,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      index: true,
    },
    significance: {
      type: String,
      enum: ['low', 'medium', 'high', 'pivotal'],
      default: 'medium',
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    sources: {
      type: [eventSourceSchema],
      required: true,
      validate: {
        validator: function (sources) {
          return sources && sources.length > 0;
        },
        message: 'At least one source is required',
      },
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    externalIds: {
      type: Map,
      of: String,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    region: {
      type: String,
      trim: true,
      index: true,
    },
    // Location data with properly structured GeoJSON format
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
    relatedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HistoricalEvent',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted date
historicalEventSchema.virtual('formattedDate').get(function () {
  const parts = [];
  if (this.day) parts.push(this.day);
  if (this.month) parts.push(this.month);
  parts.push(this.year);

  return parts.join('-');
});

// Add plugins for consistent behavior
historicalEventSchema.plugin(toJSON);
historicalEventSchema.plugin(paginate);

// Text index for search
historicalEventSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 } }
);

// Compound index for efficient filtering
historicalEventSchema.index({ year: 1, category: 1, significance: 1 });

// Geospatial index on the proper locationCoordinates field
historicalEventSchema.index({ locationCoordinates: '2dsphere' });

/**
 * @typedef HistoricalEvent
 */
const HistoricalEvent = mongoose.model('HistoricalEvent', historicalEventSchema);

module.exports = HistoricalEvent;
