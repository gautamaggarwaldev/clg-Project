import axios from 'axios';
import PDFDocument from 'pdfkit';
import IPScan from '../schema/ipSchema.js';
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

const scanIPAddress = async (req, res) => {
  const { ip } = req.params;

  // Validate IP format first
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IP address format'
    });
  }

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY
      }
    });

    const attributes = response.data.data.attributes;

    // Safely handle dates
    const safeDate = (timestamp) => {
      if (!timestamp) return null;
      try {
        return new Date(timestamp * 1000);
      } catch (e) {
        console.error('Date conversion error:', e);
        return null;
      }
    };

    // Prepare update data
    const updateData = {
      ip,
      country: attributes.country || null,
      reputation: attributes.reputation || 0,
      stats: attributes.last_analysis_stats || {},
      as_owner: attributes.as_owner || null,
      network: attributes.network || null,
      whois: attributes.whois || null,
      last_analysis_date: safeDate(attributes.last_analysis_date),
      last_modification_date: safeDate(attributes.last_modification_date),
      whois_date: safeDate(attributes.whois_date),
      updatedAt: new Date() // Track when we last updated this record
    };

    // Remove null values to avoid overwriting existing data with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Store in DB
    await IPScan.findOneAndUpdate(
      { ip },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'IP address report fetched successfully',
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching IP report:', error.message);
    
    // Handle different types of errors
    let statusCode = 500;
    let errorMessage = 'Failed to fetch IP report';
    
    if (error.response) {
      // VirusTotal API error
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      // No response received
      errorMessage = 'No response received from VirusTotal API';
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error?.response?.data || error.message
    });
  }
};

const downloadIPReportAsPDF = async (req, res) => {
  const { ip } = req.params;

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY
      }
    });

    const data = response.data.data;

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', `attachment; filename="${ip}_ip_report.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text(`IP Address Report for ${ip}`, { underline: true });
    doc.moveDown();

    const attr = data.attributes;

    doc.fontSize(12).text(`Country: ${attr.country || 'N/A'}`);
    doc.text(`Reputation: ${attr.reputation}`);
    doc.text(`Network: ${attr.network}`);
    doc.text(`Last Analysis Date: ${new Date(attr.last_analysis_date * 1000).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Analysis Stats:', { underline: true });
    Object.entries(attr.last_analysis_stats).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`);
    });

    doc.moveDown();
    doc.fontSize(14).text('AS Owner:', { underline: true });
    doc.fontSize(12).text(`${attr.as_owner || 'N/A'}`);

    doc.moveDown();
    doc.fontSize(14).text('Whois :', { underline: true });
    doc.fontSize(12).text(`${attr.whois || 'N/A'}`);

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error?.response?.data || error.message
    });
  }
};
const getAllIPScanHistory = async (req, res) => {
  try {
    const scans = await IPScan.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'IP scan history fetched successfully',
      data: scans
    });
  } catch (error) {
    console.error('Error fetching IP history:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch IP scan history',
      error: error.message
    });
  }
};
export { scanIPAddress, downloadIPReportAsPDF, getAllIPScanHistory };