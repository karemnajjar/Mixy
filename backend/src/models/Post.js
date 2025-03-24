const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    filter: {
      type: String,
      default: 'normal'
    }
  }],
  location: {
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  music: {
    trackId: String,
    title: String,
    artist: String,
    previewUrl: String
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for location-based queries
postSchema.index({ 'location.coordinates': '2dsphere' });
// Index for hashtag searches
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema); 