import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { addTraceOnChain } from '../blockchain.js';

const router = express.Router();

router.post('/lab', async (req, res) => {
  try {
    const { batchId, factoryId, dnaReportSummary, pesticideReportSummary } = req.body;
    const payload = { factoryId, dnaReportSummary, pesticideReportSummary };
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const txHash = await addTraceOnChain(batchId, 'factory', hash);
    await pool.query(`INSERT INTO events(batch_id, actor, payload, data_hash, tx_hash) VALUES($1,$2,$3,$4,$5)`, [batchId, 'factory', JSON.stringify(payload), hash, txHash]);
    res.json({ success: true, txHash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'factory lab failed' });
  }
});

export default router;