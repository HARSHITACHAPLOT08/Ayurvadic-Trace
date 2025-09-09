import express from 'express';
import pool from '../db.js';
import { readTraceOnChain } from '../blockchain.js';

const router = express.Router();

router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = (await pool.query('SELECT * FROM batches WHERE batch_id=$1', [batchId])).rows[0];
    const events = (await pool.query('SELECT * FROM events WHERE batch_id=$1 ORDER BY created_at', [batchId])).rows;
    const chain = await readTraceOnChain(batchId);
    res.json({ batch, events, chain });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'not found' });
  }
});

export default router;