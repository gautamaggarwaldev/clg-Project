import axios from "axios";
import URLScan from "../schema/urlScanSchema.js";

const scanUrlService = async (url, userId) => {
  const submitRes = await axios.post( 
    "https://www.virustotal.com/api/v3/urls",
    `url=${url}`,
    {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const analysisId = submitRes.data.data.id;

  // ⏳ Wait and poll for status (max 5 retries with 3s delay)
  let analysisRes;
  let retries = 5;

  while (retries > 0) {
    analysisRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY,
        },
      }
    );

    const status = analysisRes.data.data.attributes.status;

    if (status === "completed") break;

    // Wait 3 seconds before retry
    await new Promise((res) => setTimeout(res, 3000));
    retries--;
  }

  const newScan = await URLScan.create({
    url,
    scanResult: analysisRes.data.data,
    scannedBy: userId,
  });

  return newScan;
};

const getUserScannedUrlsService = async (userId) => {
  const scans = await URLScan.find({ scannedBy: userId })
    .sort({ createdAt: -1 })
    .select("url scanResult.attributes.last_analysis_stats createdAt");

  return scans;
};

export { scanUrlService, getUserScannedUrlsService };
