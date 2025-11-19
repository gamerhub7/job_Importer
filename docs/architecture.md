# Architecture Notes

- Producer: server cron reads FEEDS and pushes a batch job to BullMQ.
- Queue: Redis stores queue; BullMQ handles retries/backoff.
- Workers: independent processes pull batch jobs and upsert into MongoDB.
- Data: `jobs` collection stores job documents; `import_logs` stores per-run metrics.

Design decisions:
- MongoDB: flexible for semi-structured job fields.
- BullMQ: battle-tested queue with retry/backoff.
- Batch jobs: less queue overhead and easier to assert per-run logs.

Scalability:
- Increase number of worker processes or pods to increase throughput.
- Split scheduler into separate microservice if needed.
- Use a DLQ for permanent failures.
