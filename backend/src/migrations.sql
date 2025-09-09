CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  batch_id TEXT UNIQUE NOT NULL,
  farmer_id TEXT,
  crop_name TEXT,
  quality TEXT,
  harvest_date DATE,
  location JSONB,
  practices TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  batch_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  payload JSONB,
  data_hash TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT now()
);