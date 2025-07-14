import axios from 'axios';
import PDFDocument from 'pdfkit';
import FormData from 'form-data';
import fs from 'fs';
import FileScan from '../schema/fileScanSchema.js'; 

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

const uploadAndScanFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('file', fileStream);

    const response = await axios.post(
      'https://www.virustotal.com/api/v3/files',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-apikey': VIRUSTOTAL_API_KEY,
        },
      }
    );

    const analysisId = response.data.data.id;

    const newFileScan = new FileScan({
      originalName: req.file.originalname,
      scanId: analysisId,
      status: 'queued',
    });
    await newFileScan.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded and scanning started',
      data: {
        scanId: analysisId,
      },
    });
  } catch (err) {
    console.error('File Scan Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to scan file' });
  }
};

const getFileScanReport = async (req, res) => {
  try {
    const { scanId } = req.params;

    const response = await axios.get(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY,
      },
    });

    const data = response.data?.data || {};
    const attributes = data.attributes || {};
    const fileInfo = response.data?.meta?.file_info || null;


    if (!Object.keys(attributes).length || !fileInfo) {
      return res.status(400).json({
        success: false,
        message: "Scan result is not ready or malformed",
      });
    }

    const results = attributes.results || {};
    const stats = attributes.stats || {};

    res.status(200).json({
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
    });

  } catch (error) {
    console.error("🚨 Report Fetch Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

const downloadFileReportPDF = async (req, res) => {
  try {
    const { scanId } = req.params;

    // 1. Fetch scan report from VirusTotal
    const { data } = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${scanId}`,
      {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
        },
      }
    );

    const attributes = data.data.attributes;
    const results = attributes.results || {};
    const stats = attributes.stats;
    const fileInfo = data.meta?.file_info || {};

    // 2. Create a PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=VirusScanReport-${scanId}.pdf`
    );
    doc.pipe(res);

    // 3. Title and basic info
    doc.fontSize(20).text('VirusTotal File Scan Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Scan ID: ${scanId}`);
    doc.text(`Status: ${attributes.status}`);
    doc.text(`Detected Engines: ${stats.malicious}`);
    doc.text(`Total Engines: ${Object.keys(results).length}`);
    doc.moveDown();
    doc.text(`SHA256: ${fileInfo.sha256}`);
    doc.text(`MD5: ${fileInfo.md5}`);
    doc.text(`SHA1: ${fileInfo.sha1}`);
    doc.text(`File Size: ${fileInfo.size} bytes`);

    doc.moveDown().fontSize(14).text('Detection Summary:', { underline: true });

    // 4. List malicious results
    Object.entries(results).forEach(([engine, result]) => {
      if (result.category === 'malicious' || result.result) {
        doc
          .fontSize(12)
          .text(`- ${engine}: ${result.result || '⚠️ suspicious'} [${result.category}]`);
      }
    });

    doc.end();
  } catch (err) {
    console.error('PDF generation failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};



export { uploadAndScanFile, getFileScanReport, downloadFileReportPDF };

