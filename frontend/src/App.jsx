import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function App(){
  const [batchId, setBatchId] = useState('');
  const [qr, setQr] = useState(null);
  const [log, setLog] = useState('');
  const [product, setProduct] = useState(null);

  async function createBatch(){
    setLog('Creating batch...');
    const payload = { farmerId: 'FARMER-1', cropName: 'Ashwagandha', quality: 'A', harvestDate: '2025-08-01', location: { place: 'MP' }, practices: 'Organic' };
    try {
      const res = await fetch(`${API}/farmer/create`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const j = await res.json();
      if(!j.batchId){ setLog('Error: ' + (j.error || 'No batchId')); return; }
      setBatchId(j.batchId);
      const dataUrl = await QRCode.toDataURL(JSON.stringify({ batchId: j.batchId }));
      setQr(dataUrl);
      setLog(`Batch created: ${j.batchId} (tx ${j.txHash})`);
    } catch (e){
      console.error(e);
      setLog('Create failed: ' + e.message);
    }
  }

  async function fetchProduct(id){
    setLog('Fetching product...');
    try{
      const r = await fetch(`${API}/product/${id}`);
      const j = await r.json();
      setProduct(j);
      setLog('Product fetched');
    }catch(e){ setLog('Fetch error: ' + e.message); }
  }

  async function startScan(){
    setLog('Starting camera...');
    const html5QrCode = new Html5Qrcode('reader');
    try{
      await html5QrCode.start({ facingMode: { exact: 'environment' } }, { fps: 10 }, async (decoded) => {
        try{
          const parsed = JSON.parse(decoded);
          setLog('QR decoded: ' + JSON.stringify(parsed));
          if(parsed.batchId){
            await fetchProduct(parsed.batchId);
          }
          await html5QrCode.stop();
        }catch(e){ console.error('parse error', e); }
      });
    }catch(e){
      // fallback to user-facing camera
      try{
        await html5QrCode.start({ facingMode: 'user' }, { fps: 10 }, async (decoded) => {
          const parsed = JSON.parse(decoded);
          if(parsed.batchId) await fetchProduct(parsed.batchId);
        });
      }catch(err){ console.error('camera start failed', err); setLog('Camera not accessible: ' + err.message); }
    }
  }

  return (
    <div>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h1 style={{color:'white'}}>AyurTrace — Full Stack Demo</h1>
        <div style={{color:'white'}}>Demo</div>
      </header>

      <div className="card">
        <h2>Create farmer batch</h2>
        <p>Click to create a demo batch. This calls <code>/api/farmer/create</code>.</p>
        <button onClick={createBatch} style={{padding:'8px 12px',background:'#10b981',border:'none',color:'white',borderRadius:8}}>Create batch</button>

        {batchId && (
          <div style={{marginTop:12}}>
            <div><strong>Batch ID:</strong> {batchId}</div>
            {qr && <img src={qr} alt="qr" style={{width:160,marginTop:8}} />}
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:12}}>
        <h2>Scan QR (camera)</h2>
        <div id="reader" style={{width:320,height:240,background:'#f3f4f6'}}></div>
        <button onClick={startScan} style={{marginTop:8,padding:'8px 12px',background:'#06b6d4',border:'none',color:'white',borderRadius:8}}>Start scan</button>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h2>Product details</h2>
        <pre style={{whiteSpace:'pre-wrap'}}>{log}</pre>
        {product && (
          <div style={{marginTop:8}}>
            <h3>Batch</h3>
            <pre>{JSON.stringify(product.batch, null, 2)}</pre>
            <h3>Events</h3>
            <pre>{JSON.stringify(product.events, null, 2)}</pre>
            <h3>Chain</h3>
            <pre>{JSON.stringify(product.chain, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}