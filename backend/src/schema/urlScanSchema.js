import mongoose from "mongoose";

const urlScanSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    scanResult: {
      type: Object,
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const URLScan = mongoose.model("URLScan", urlScanSchema);

export default URLScan;
