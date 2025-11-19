const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  title: String,
  company: String,
  description: String,
  location: String,
  url: String,
  categories: [String],
  raw: Object,
  sourceUrl: String,
  lastSeen: Date
}, { timestamps: true });

JobSchema.index({ externalId: 1, sourceUrl: 1 }, { unique: true });

module.exports = mongoose.model('Job', JobSchema);
