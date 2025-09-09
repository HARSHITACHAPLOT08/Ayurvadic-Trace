import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { addTraceOnChain } from '../blockchain.js';

const router = express.Router();

router.post('/ship', async (req, res) => {.
  try {
    const { batchId, distributorId, shipDetails } = req.body;
    const payload = { distributorId, shipDetails };
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const txHash = await addTraceOnChain(batchId, 'distributor', hash);
    await pool.query(`INSERT INTO events(batch_id, actor, payload, data_hash, tx_hash) VALUES($1,$2,$3,$4,$5)`, [batchId, 'distributor', JSON.stringify(payload), hash, txHash]);
    res.json({ success: true, txHash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ship failed' });
  }
});

export default router;