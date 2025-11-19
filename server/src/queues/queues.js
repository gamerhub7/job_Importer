// server/src/queues/queues.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Create a shared ioredis connection configured for BullMQ
// Important: maxRetriesPerRequest must be null for BullMQ to work correctly.
const redisConnectionOptions = {
  // keep default host/port/url usage but override this important option
  maxRetriesPerRequest: null,
  // optional but recommended for performance
  enableAutoPipelining: true,
  // you can add tls or other ioredis options here if needed
};

const connection = new IORedis(process.env.REDIS_URL, redisConnectionOptions);

// Create the queue using the same connection object
const importQueue = new Queue('job-import-queue', { connection });

module.exports = { importQueue, connection };
