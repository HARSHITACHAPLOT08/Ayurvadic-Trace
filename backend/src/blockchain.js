import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
import TraceAbi from './TraceAbi.json' assert { type: 'json' };

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, TraceAbi.abi || TraceAbi, wallet);

export async function addTraceOnChain(batchId, role, dataHash) {
  const tx = await contract.addTrace(batchId, role, dataHash);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function readTraceOnChain(batchId) {
  const count = await contract.getTraceCount(batchId);
  const out = [];
  for (let i = 0; i < Number(count); i++) {
    const t = await contract.getTrace(batchId, i);
    out.push({ batchId: t[0], actorRole: t[1], dataHash: t[2], timestamp: Number(t[3]) });
  }
  return out;
}