import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { addTraceOnChain } from '../blockchain.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { farmerId, cropName, quality, harvestDate, location, practices } = req.body;
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const payload = { farmerId, cropName, quality, harvestDate, location, practices };
    const dataStr = JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(dataStr).digest('hex');

    await pool.query(
      `INSERT INTO batches(batch_id, farmer_id, crop_name, quality, harvest_date, location, practices) VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [batchId, farmerId, cropName, quality, harvestDate, JSON.stringify(location), practices]
    );

    const txHash = await addTraceOnChain(batchId, 'farmer', hash);

    await pool.query(
      `INSERT INTO events(batch_id, actor, payload, data_hash, tx_hash) VALUES($1,$2,$3,$4,$5)`,
      [batchId, 'farmer', JSON.stringify(payload), hash, txHash]
    );

    res.json({ success: true, batchId, txHash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'create failed' });
  }
});

export default router;