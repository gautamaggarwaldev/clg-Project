import express from "express";
import { analyzeReport, generateDomainReport } from "../controller/aiAnalyzerController.js";

const router = express.Router();

router.post("/analyze-report", analyzeReport);
router.post('/domain-summary', async (req, res) => {
    console.log("Domain Summary AI Route Hit");
  try {
    const domainData = req.body;
    
    if (!domainData || !domainData.data) {
      return res.status(400).json({
        success: false,
        message: "Invalid domain data provided"
      });
    }

    const report = await generateDomainReport(domainData);
    res.json(report);
    
  } catch (error) {
    console.error("Error in domain summary route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

export default router;
