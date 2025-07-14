import axios from 'axios';
import PDFDocument from 'pdfkit';
import IPScan from '../schema/ipSchema.js';
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

// const scanIPAddress = async (req, res) => {
//   const { ip } = req.params;

//   if (!ip) {
//     return res.status(400).json({ success: false, message: 'IP address is required' });
//   }

//   try {
//     const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
//       headers: {
//         'x-apikey': VIRUSTOTAL_API_KEY
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'IP address report fetched successfully',
//       data: response.data.data
//     });
//   } catch (error) {
//     console.error('Error fetching IP report:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch IP report',
//       error: error?.response?.data || error.message
//     });
//   }
// };


const scanIPAddress = async (req, res) => {
  const { ip } = req.params;

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY
      }
    });

    const attributes = response.data.data.attributes;

    // Optional: store in DB
    await IPScan.findOneAndUpdate(
      { ip },
      {
        ip,
        country: attributes.country,
        reputation: attributes.reputation,
        stats: attributes.last_analysis_stats,
        as_owner: attributes.as_owner,
        network: attributes.network,
        whois: attributes.whois || 'N/A',
        last_analysis_date: new Date(attributes.last_analysis_date * 1000)
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'IP address report fetched successfully',
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching IP report:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch IP report',
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