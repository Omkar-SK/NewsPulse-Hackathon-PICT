const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  articleId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  body: {
    type: String
  },
  image: {
    type: String
  },
  source: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  sentiment: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  uri: {
    type: String
  },
  lang: {
    type: String
  },
  shares: {
    type: Number,
    default: 0
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  cacheKey: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Index for efficient queries
ArticleSchema.index({ cacheKey: 1, expiresAt: 1 });
ArticleSchema.index({ articleId: 1 });
ArticleSchema.index({ category: 1 });

module.exports = mongoose.model('Article', ArticleSchema);