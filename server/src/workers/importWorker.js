require('dotenv').config();
const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const { connection } = require('../queues/queues');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
const normalize = require('../services/normalize');
const hasChanged = require('../utils/hasChanged');
const db = require('../config/db');

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '3', 10);

async function startWorker() {
  await db.connect(process.env.MONGO_URI);
  const worker = new Worker('job-import-queue', async job => {
    const { sourceUrl, items } = job.data;
    const report = { totalFetched: (items && items.length) || 0, totalImported: 0, newJobs: 0, updatedJobs: 0, failedJobs: [] };

    for (const item of (items || [])) {
      try {
        const normalized = normalize(item, sourceUrl);
        const filter = { externalId: normalized.externalId, sourceUrl };
        const existing = await Job.findOne(filter).exec();
        if (!existing) {
          await Job.create({ ...normalized, lastSeen: new Date() });
          report.newJobs++;
          report.totalImported++;
        } else {
          if (hasChanged(existing, normalized)) {
            await Job.updateOne(filter, { $set: { ...normalized, lastSeen: new Date() } }).exec();
            report.updatedJobs++;
            report.totalImported++;
          } else {
            // not changed — update lastSeen
            await Job.updateOne(filter, { $set: { lastSeen: new Date() } }).exec();
          }
        }
      } catch (err) {
        report.failedJobs.push({ externalId: item && (item.guid || item.id || item.link) || null, reason: err.message, details: (err && err.stack) });
      }
    }

    // save import log
    await ImportLog.create({
      sourceUrl,
      totalFetched: report.totalFetched,
      totalImported: report.totalImported,
      newJobs: report.newJobs,
      updatedJobs: report.updatedJobs,
      failedJobs: report.failedJobs
    });

    return report;
  }, { connection, concurrency: CONCURRENCY });

  worker.on('completed', (job, result) => {
    console.log('Worker completed job', job.id, 'result:', result);
  });
  worker.on('failed', (job, err) => {
    console.error('Worker job failed', job.id, err);
  });
}

startWorker().catch(err => {
  console.error('Worker failed to start', err);
  process.exit(1);
});
