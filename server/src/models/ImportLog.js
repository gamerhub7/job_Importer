const mongoose = require('mongoose');

const FailedEntry = new mongoose.Schema({
  externalId: String,
  reason: String,
  details: Object
}, { _id: false });

const ImportLogSchema = new mongoose.Schema({
  sourceUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [FailedEntry]
});

module.exports = mongoose.model('ImportLog', ImportLogSchema);
