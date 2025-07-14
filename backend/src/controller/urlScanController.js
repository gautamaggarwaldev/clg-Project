import URLScan from "../schema/urlScanSchema.js";
import { scanUrlService } from "../service/urlScanService.js";

const scanUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  try {
    const result = await scanUrlService(url, req.user?.id || null);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("URL Scan Error:", error.message);
    res.status(500).json({ success: false, message: "URL scan failed" });
  }
};


const getMyScannedUrls = async (req, res) => {
  try {
    const scans = await URLScan.find({ scannedBy: req.user._id }).sort({
      createdAt: -1,
    });

    const formattedScans = scans.map((scan) => {
      const stats = scan.scanResult?.attributes?.stats || {
        malicious: -1,
        suspicious: -1,
        harmless: -1,
        undetected: -1,
        timeout: -1,
      };

      return {
        url: scan.url,
        status: scan.scanResult?.attributes?.status || "unknown",
        timestamp: scan.createdAt,
        stats,
      };
    });

    res.status(200).json({ success: true, scans: formattedScans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// const getDetailedUrlReport = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const scan = await URLScan.findOne({ id });

//     if (!scan) {
//       return res.status(404).json({
//         success: false,
//         message: "Scan report not found for the given URL",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         url: scan.url,
//         timestamp: scan.createdAt,
//         status: scan.scanResult?.attributes?.status || "unknown",
//         stats: scan.scanResult?.attributes?.stats || {},
//         results: scan.scanResult?.attributes?.results || {},
//         scan_engine_count: Object.keys(
//           scan.scanResult?.attributes?.results || {}
//         ).length,
//         virustotal_link: scan.scanResult?.links?.item || null,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching detailed report:", error.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

const getDetailedUrlReport = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await URLScan.findOne({ id });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan report not found for the given URL",
      });
    }

    const results = scan.scanResult?.attributes?.results || {};
    const scanEngineCount = Object.keys(results).length;

    res.status(200).json({
      success: true,
      data: {
        url: scan.url,
        timestamp: scan.createdAt,
        status: scan.scanResult?.attributes?.status || "unknown",
        stats: scan.scanResult?.attributes?.stats || {
          malicious: 0,
          suspicious: 0,
          undetected: 0,
          harmless: 0,
          timeout: 0,
        },
        results,
        scan_engine_count: scanEngineCount,
        virustotal_link:
          scan.scanResult?.links?.self ||
          `https://www.virustotal.com/gui/url/${scan.encodedUrl}`, // fallback if stored
      },
    });
  } catch (error) {
    console.error("Error fetching detailed report:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export { scanUrl, getMyScannedUrls, getDetailedUrlReport };
