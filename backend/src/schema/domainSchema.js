import mongoose from "mongoose";

const domainSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DomainScan", domainSchema);
