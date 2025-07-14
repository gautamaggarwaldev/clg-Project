import mongoose from 'mongoose';

const ipScanSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  country: String,
  reputation: Number,
  stats: Object,
  as_owner: String,
  network: String,
  whois: String,
  last_analysis_date: Date
}, { timestamps: true });

export default mongoose.model('IPScan', ipScanSchema);
