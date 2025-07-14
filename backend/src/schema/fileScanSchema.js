import mongoose from "mongoose";

const fileScanSchema = new mongoose.Schema(
  {
    originalName: String,
    scanId: {
      type: String,
      required: true,
      unique: true,
    },
    status: String,
    stats: Object,
    results: Object,
  },
  { timestamps: true }
);

export default mongoose.model("FileScan", fileScanSchema);
