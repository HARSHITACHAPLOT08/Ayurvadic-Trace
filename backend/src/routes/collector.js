import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { addTraceOnChain } from '../blockchain.js';

const router = express.Router();

// Collector adds storage/receipt details to an existing batch
router.post('/log', async (req, res) => {
  try {
    const { batchId, collectorId, dateReceipt, storageConditions, cleaningProcess, labReportBase64 } = req.body;
    const payload = { collectorId, dateReceipt, storageConditions, cleaningProcess, labReportPresent: !!labReportBase64 };
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const txHash = await addTraceOnChain(batchId, 'collector', hash);

    await pool.query(`INSERT INTO events(batch_id, actor, payload, data_hash, tx_hash) VALUES($1,$2,$3,$4,$5)`,
      [batchId, 'collector', JSON.stringify(payload), hash, txHash]);

    res.json({ success: true, txHash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'collector logging failed' });
  }
});

export default router;