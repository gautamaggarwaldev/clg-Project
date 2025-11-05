import axios from "axios";
import PDFDocument from "pdfkit";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import FileScan from "../schema/fileScanSchema.js";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

// Validate environment variables
if (!VIRUSTOTAL_API_KEY) {
  console.error("🚨 VIRUSTOTAL_API_KEY is not set in environment variables");
}

// Helper function to clean up uploaded files
const cleanupFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("Temporary file deleted:", filePath);
      }
    });
  }
};

// File validation function
const validateFile = (file) => {
  if (!file) {
    return { valid: false, message: "No file provided" };
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { valid: false, message: "File size too large. Maximum 100MB allowed." };
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.docx', '.csv', '.txt', '.exe', '.zip', '.png', '.jpg', '.jpeg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { 
      valid: false, 
      message: `Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}` 
    };
  }

  return { valid: true };
};

const uploadAndScanFile = async (req, res) => {
  let filePath = null;

  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;

    // Validate file
    const validation = validateFile(req.file);
    if (!validation.valid) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Check if API key is available
    if (!VIRUSTOTAL_API_KEY) {
      cleanupFile(filePath);
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key not configured",
      });
    }

    console.log("📤 Uploading file to VirusTotal:", {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append("file", fileStream);

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
        timeout: 60000, // 60 second timeout
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024, // 100MB
      }
    );

    console.log("✅ VirusTotal upload response:", response.data);

    const analysisId = response.data.data.id;

    // Save to database
    const newFileScan = new FileScan({
      originalName: req.file.originalname,
      scanId: analysisId,
      status: "queued",
      fileSize: req.file.size,
      uploadedAt: new Date(),
    });
    await newFileScan.save();

    // Clean up the uploaded file
    cleanupFile(filePath);

    res.status(200).json({
      success: true,
      message: "File uploaded and scanning started",
      data: {
        scanId: analysisId,
      },
    });

  } catch (err) {
    // Clean up file in case of error
    if (filePath) {
      cleanupFile(filePath);
    }

    console.error("❌ File Scan Error:", err.message);
    
    let errorMessage = "Failed to scan file";
    
    if (err.response) {
      // VirusTotal API error
      console.error("VirusTotal API Error:", err.response.data);
      
      if (err.response.status === 401) {
        errorMessage = "Invalid VirusTotal API key";
      } else if (err.response.status === 413) {
        errorMessage = "File too large for VirusTotal";
      } else if (err.response.status === 429) {
        errorMessage = "VirusTotal API rate limit exceeded";
      } else {
        errorMessage = `VirusTotal API error: ${err.response.status}`;
      }
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = "Request timeout - VirusTotal is taking too long to respond";
    } else if (err.message) {
      errorMessage = err.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getFileScanReport = async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key not configured",
      });
    }

    console.log("📋 Fetching scan report for:", scanId);

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${scanId}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
        timeout: 30000,
      }
    );

    const data = response.data?.data || {};
    const attributes = data.attributes || {};
    const fileInfo = response.data?.meta?.file_info || {};

    console.log("📊 Scan status:", attributes.status);

    if (!Object.keys(attributes).length) {
      return res.status(400).json({
        success: false,
        message: "Scan result is not ready or malformed",
      });
    }

    const results = attributes.results || {};
    const stats = attributes.stats || {};

    // Update database with scan results
    await FileScan.findOneAndUpdate(
      { scanId: scanId },
      {
        status: attributes.status,
        stats: stats,
        results: results,
        completedAt: attributes.status === 'completed' ? new Date() : null,
      }
    );

    const responseData = {
      success: true,
      data: {
        status: attributes.status || "unknown",
        date: attributes.date ? new Date(attributes.date * 1000) : null,
        file_info: {
          sha256: fileInfo.sha256 || "",
          md5: fileInfo.md5 || "",
          sha1: fileInfo.sha1 || "",
          size: fileInfo.size || 0,
        },
        stats,
        scan_engine_count: Object.keys(results).length,
        results,
        virustotal_link: data?.links?.item || null,
      },
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("🚨 Report Fetch Error:", error.message);
    
    let statusCode = 500;
    let errorMessage = "Failed to fetch report";

    if (error.response) {
      console.error("VirusTotal API Response Error:", error.response.data);
      
      if (error.response.status === 404) {
        statusCode = 404;
        errorMessage = "Scan ID not found";
      } else if (error.response.status === 401) {
        statusCode = 500;
        errorMessage = "Invalid VirusTotal API key";
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const downloadFileReportPDF = async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key not configured",
      });
    }

    // Fetch scan report from VirusTotal
    const { data } = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${scanId}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    );

    const attributes = data.data.attributes;
    const results = attributes.results || {};
    const stats = attributes.stats || {};
    const fileInfo = data.meta?.file_info || {};

    // Create a PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FileScanReport-${scanId}.pdf`
    );
    doc.pipe(res);

    // Title and basic info
    doc.fontSize(20).text("File Security Scan Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Scan ID: ${scanId}`);
    doc.text(`Status: ${attributes.status}`);
    doc.text(`Scan Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text(`Malicious: ${stats.malicious || 0}`);
    doc.text(`Suspicious: ${stats.suspicious || 0}`);
    doc.text(`Harmless: ${stats.harmless || 0}`);
    doc.text(`Undetected: ${stats.undetected || 0}`);
    doc.text(`Total Engines: ${Object.keys(results).length}`);
    doc.moveDown();
    
    // File information
    doc.fontSize(14).text("File Information:", { underline: true });
    doc.fontSize(10);
    doc.text(`SHA256: ${fileInfo.sha256 || 'N/A'}`);
    doc.text(`MD5: ${fileInfo.md5 || 'N/A'}`);
    doc.text(`SHA1: ${fileInfo.sha1 || 'N/A'}`);
    doc.text(`File Size: ${fileInfo.size ? (fileInfo.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);

    // Detection results
    if (stats.malicious > 0) {
      doc.moveDown().fontSize(14).text("Malicious Detections:", { underline: true });
      doc.fontSize(10);
      Object.entries(results).forEach(([engine, result]) => {
        if (result.category === "malicious") {
          doc.text(`- ${engine}: ${result.result || "Malicious"}`);
        }
      });
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate PDF",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getReportByHash = async (req, res) => {
  const hash = req.params.hash;

  if (!VIRUSTOTAL_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "VirusTotal API key not configured",
    });
  }

  try {
    // First try to get the existing report
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/files/${hash}`,
      {
        headers: { "x-apikey": VIRUSTOTAL_API_KEY },
        timeout: 30000,
      }
    );

    const data = response.data.data;

    res.status(200).json({
      success: true,
      message: "File report fetched successfully by hash",
      data: {
        hash: hash,
        status: data.attributes.last_analysis_stats,
        date: data.attributes.date,
        file_info: {
          sha256: data.attributes.sha256,
          md5: data.attributes.md5,
          sha1: data.attributes.sha1,
          size: data.attributes.size,
        },
        results: data.attributes.last_analysis_results,
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      // File not found in VirusTotal, try to submit the hash for analysis
      try {
        const submitResponse = await axios.post(
          `https://www.virustotal.com/api/v3/files/${hash}/analyse`,
          {},
          {
            headers: { "x-apikey": VIRUSTOTAL_API_KEY },
          }
        );

        // Return a response indicating the file is being analyzed
        res.status(202).json({
          success: true,
          message: "File not previously scanned. Submitted for analysis. Please check back later.",
          data: {
            analysis_id: submitResponse.data.data.id,
            status: "queued",
          },
        });
      } catch (submitError) {
        console.error("Hash submission error:", submitError.message);
        res.status(400).json({
          success: false,
          message: "Failed to submit hash for analysis",
          error: submitError.response?.data || submitError.message,
        });
      }
    } else {
      console.error("Hash report error:", error.message);
      res.status(400).json({
        success: false,
        message: "Failed to fetch report by hash",
        error: error.response?.data || error.message,
      });
    }
  }
};

export {
  uploadAndScanFile,
  getFileScanReport,
  downloadFileReportPDF,
  getReportByHash,
};