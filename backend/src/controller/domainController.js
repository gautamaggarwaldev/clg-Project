import axios from 'axios';
import PDFDocument from 'pdfkit';
import DomainScan from '../schema/domainSchema.js';

const getDomainReport = async (req, res) => {
  const { domain } = req.params;
  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
    });

    await DomainScan.create({ domain, data: response.data });

    res.status(200).json({
      success: true,
      message: 'Domain report fetched successfully',
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domain report',
      error: error?.response?.data || error.message,
    });
  }
};

const downloadDomainReportPDF = async (req, res) => {
  const { domain } = req.params;

  try {
    const domainDoc = await DomainScan.findOne({ domain });
    if (!domainDoc) return res.status(404).json({ message: 'Domain report not found in DB' });

    const report = domainDoc.data;
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${domain}_report.pdf`);

    doc.pipe(res);
    doc.fontSize(16).text(`VirusTotal Report for Domain: ${domain}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Reputation: ${report.data.attributes.reputation || 'N/A'}`);
    doc.text(`Categories: ${(report.data.attributes.categories && Object.values(report.data.attributes.categories).join(', ')) || 'N/A'}`);
    doc.text(`Last Analysis Stats:`);
    const stats = report.data.attributes.last_analysis_stats;
    for (const [key, value] of Object.entries(stats)) {
      doc.text(` - ${key}: ${value}`);
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error generating PDF', error: err.message });
  }
};

const getDomainHistory = async (req, res) => {
  try {
    const scans = await DomainScan.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Domain scan history fetched successfully',
      data: scans,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching domain history', error: err.message });
  }
};
 
export {  getDomainReport, downloadDomainReportPDF, getDomainHistory };
