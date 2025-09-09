import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { addTraceOnChain } from '../blockchain.js';

const router = express.Router();

router.post('/audit', async (req, res) => {
  try {
    const { batchId, auditorId, status, remarks } = req.body;
    const payload = { auditorId, status, remarks };
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const txHash = await addTraceOnChain(batchId, 'auditor', hash);
    await pool.query(`INSERT INTO events(batch_id, actor, payload, data_hash, tx_hash) VALUES($1,$2,$3,$4,$5)`, [batchId, 'auditor', JSON.stringify(payload), hash, txHash]);
    res.json({ success: true, txHash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'audit failed' });
  }
});

export default router;