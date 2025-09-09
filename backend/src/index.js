import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import farmerRouter from './routes/farmer.js';
import collectorRouter from './routes/collector.js';
import auditorRouter from './routes/auditor.js';
import factoryRouter from './routes/factory.js';
import distributorRouter from './routes/distributor.js';
import productRouter from './routes/product.js';
import pool from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api/farmer', farmerRouter);
app.use('/api/collector', collectorRouter);
app.use('/api/auditor', auditorRouter);
app.use('/api/factory', factoryRouter);
app.use('/api/distributor', distributorRouter);
app.use('/api/product', productRouter);

// simple health
app.get('/health', (req,res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));