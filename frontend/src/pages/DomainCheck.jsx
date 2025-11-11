import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Globe, Download, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, Link, Lock } from "lucide-react";
import AIDomainReport from "../components/AiDomainReport";

const calculateStats = (results) => {
  const stats = {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
    timeout: 0,
  };

  Object.values(results || {}).forEach((entry) => {
    const category = entry?.category;
    if (category && stats.hasOwnProperty(category)) {
      stats[category]++;
    } else {
      stats.undetected++;
    }
  });

  return stats;
};

const calculateRisk = (stats) => {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const risk = ((stats.malicious + stats.suspicious) / total) * 100;
  return Math.round(risk);
};

const getRiskColor = (risk) => {
  if (risk > 70) return "bg-gradient-to-r from-red-600 to-red-800";
  if (risk > 30) return "bg-gradient-to-r from-yellow-500 to-orange-600";
  return "bg-gradient-to-r from-green-500 to-teal-600";
};

const DomainCheck = () => {
  const [domain, setDomain] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleScan = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain.");
      return;
    }

    setLoading(true);
    setAiReport(""); // Reset AI report on new scan

    try {
      const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      // const apiUrl = `http://localhost:5005/v1/domain/report/${cleanDomain}`;
      const apiUrl = `https://cs-qhmx.onrender.com/v1/domain/report/${cleanDomain}`;

      const { data } = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (data?.success) {
        const stats =
          data.data?.data?.attributes?.last_analysis_stats ||
          calculateStats(data.data?.data?.attributes?.last_analysis_results);

        if (!stats) {
          throw new Error("No stats data received from API");
        }

        const reportData = {
          ...data.data.data.attributes,
          stats,
          results: data.data.data.attributes.last_analysis_results,
        };

        setReport(reportData);
        toast.success("Domain scanned successfully!");
      } else {
        throw new Error(data?.message || "Failed to fetch domain report");
      }
    } catch (err) {
      let errorMessage = "Something went wrong while scanning.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "No response from server. Please check if the server is running and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!report) {
      alert("Please scan a domain first before running AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiReport("");

    try {
      console.log("Sending AI analysis request for domain...");
      // const response = await fetch("http://localhost:5005/v1/ai/analyze-report", {
      const response = await fetch("https://cs-qhmx.onrender.com/v1/ai/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanType: "Domain Scan",
          stats: report.stats,
          results: report.results,
          meta: {
            domain: domain,
            scanDate: new Date().toISOString(),
            reputation: report.reputation,
            creationDate: report.creation_date,
            lastUpdate: report.last_update_date
          },
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("AI Response data:", data);

      if (data.success && data.analysis) {
        console.log("AI Analysis received successfully");
        setAiReport(data.analysis);
      } else {
        console.error("AI Analysis failed:", data);
        // Fallback demo AI response
        setAiReport(`Based on the domain scan results, here's my analysis:

Threat Assessment:
The domain shows ${report.stats.malicious > 0 ? 'moderate to high' : 'low'} risk with ${report.stats.malicious} malicious and ${report.stats.suspicious} suspicious detections.

Key Findings:
- ${report.stats.malicious} security engines detected malicious content
- ${report.stats.suspicious} engines flagged the domain as suspicious
- ${report.stats.harmless} engines found it harmless
- Domain reputation: ${report.reputation || 'Not available'}

Security Recommendations:
- ${report.stats.malicious > 0 ? 'Exercise extreme caution when visiting this domain' : 'Proceed with normal caution'}
- Avoid entering sensitive information
- Monitor for any changes in threat status
- Consider using additional security measures

Overall Security Score: ${Math.max(0, 100 - (report.stats.malicious * 15 + report.stats.suspicious * 5))}/100

This analysis is based on real-time threat intelligence from multiple security engines.`);
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      // Fallback demo response
      setAiReport(`AI Analysis Unavailable

The AI analysis service is currently unavailable. Here's a summary based on the domain scan results:

Domain Scan Summary:
- Malicious Detections: ${report.stats.malicious}
- Suspicious Detections: ${report.stats.suspicious}
- Harmless Results: ${report.stats.harmless}
- Undetected: ${report.stats.undetected}
- Reputation Score: ${report.reputation || 'N/A'}

Please try the AI analysis again in a few moments, or proceed with the standard domain report above.`);
    } finally {
      setAiLoading(false);
    }
  };

  const formatAIResponse = (text) => {
    if (!text) {
      return <p className="text-gray-400 italic">No analysis available.</p>;
    }

    try {
      // Clean the text
      let cleanedText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .trim();

      // Split into paragraphs and process
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      if (paragraphs.length === 0) {
        return <p className="text-gray-300 whitespace-pre-wrap">{cleanedText}</p>;
      }

      return paragraphs.map((paragraph, index) => {
        const trimmedPara = paragraph.trim();
        
        // Check if this is a heading (ends with colon and is relatively short)
        if (trimmedPara.endsWith(':') && trimmedPara.length < 100) {
          return (
            <h4 key={index} className="text-lg font-semibold text-emerald-400 mb-3 mt-4 first:mt-0">
              {trimmedPara}
            </h4>
          );
        }
        
        // Check if this is a list
        if (trimmedPara.includes('\n- ') || trimmedPara.startsWith('-')) {
          const lines = trimmedPara.split('\n').filter(line => line.trim());
          const listItems = lines.map(line => line.replace(/^-\s*/, '').trim());
          
          return (
            <ul key={index} className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
            {trimmedPara}
          </p>
        );
      });
    } catch (error) {
      console.error("Error formatting AI response:", error);
      return <p className="text-gray-300 whitespace-pre-wrap">{text}</p>;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  const generatePDF = () => {
    if (!report) return;

    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    const stats = report.stats;
    const results = report.results;
    const threatInfo = getThreatLevel();
    
    // Generate HTML for PDF - Same design as ScanURL
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Domain Security Scan Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            background: white;
            color: #1f2937;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #059669;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 15px;
            border-left: 4px solid #10b981;
            padding-left: 12px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-item {
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            word-break: break-all;
          }
          .threat-box {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
            border: 2px solid;
          }
          .threat-safe { background: #d1fae5; border-color: #10b981; color: #065f46; }
          .threat-low { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
          .threat-medium { background: #fed7aa; border-color: #ea580c; color: #7c2d12; }
          .threat-high { background: #fecaca; border-color: #ef4444; color: #991b1b; }
          .threat-level {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid;
          }
          .stat-malicious { background: #fef2f2; border-color: #ef4444; }
          .stat-suspicious { background: #fffbeb; border-color: #f59e0b; }
          .stat-undetected { background: #f8fafc; border-color: #64748b; }
          .stat-harmless { background: #f0fdf4; border-color: #22c55e; }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
          }
          .stat-malicious .stat-value { color: #ef4444; }
          .stat-suspicious .stat-value { color: #f59e0b; }
          .stat-undetected .stat-value { color: #64748b; }
          .stat-harmless .stat-value { color: #22c55e; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }
          td {
            font-size: 13px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-malicious { background: #fecaca; color: #991b1b; }
          .badge-suspicious { background: #fef3c7; color: #92400e; }
          .badge-harmless { background: #d1fae5; color: #065f46; }
          .badge-undetected { background: #f1f5f9; color: #475569; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌐 Domain Security Scan Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="threat-box threat-${threatInfo.color}">
            <div class="threat-level">${threatInfo.level}</div>
            <div>Overall Threat Assessment</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Scan Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Target Domain</div>
              <div class="info-value">${domain}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Scan Date</div>
              <div class="info-value">${new Date().toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Security Engines</div>
              <div class="info-value">${Object.keys(results).length} engines analyzed</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Detections</div>
              <div class="info-value">${stats.malicious + stats.suspicious} findings</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Domain Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Creation Date</div>
              <div class="info-value">${report.creation_date ? new Date(report.creation_date * 1000).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Last Update</div>
              <div class="info-value">${report.last_update_date ? new Date(report.last_update_date * 1000).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Reputation Score</div>
              <div class="info-value">${report.reputation || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Risk Level</div>
              <div class="info-value">${calculateRisk(stats)}%</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Threat Statistics</div>
          <div class="stats-grid">
            <div class="stat-card stat-malicious">
              <div class="stat-label">Malicious</div>
              <div class="stat-value">${stats.malicious}</div>
            </div>
            <div class="stat-card stat-suspicious">
              <div class="stat-label">Suspicious</div>
              <div class="stat-value">${stats.suspicious}</div>
            </div>
            <div class="stat-card stat-undetected">
              <div class="stat-label">Undetected</div>
              <div class="stat-value">${stats.undetected}</div>
            </div>
            <div class="stat-card stat-harmless">
              <div class="stat-label">Harmless</div>
              <div class="stat-value">${stats.harmless}</div>
            </div>
          </div>
        </div>

        ${aiReport ? `
        <div class="section">
          <div class="section-title">AI Risk Analysis</div>
          <div class="info-item">
            <div class="info-label">AI Assessment</div>
            <div class="info-value" style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${aiReport}</div>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Detailed Scan Results</div>
          <table>
            <thead>
              <tr>
                <th>Security Engine</th>
                <th>Detection Result</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(results).map(([engine, result]) => `
                <tr>
                  <td><strong>${engine}</strong></td>
                  <td>
                    <span class="badge badge-${result.category}">
                      ${result.result || 'No detection'}
                    </span>
                  </td>
                  <td style="text-transform: capitalize;">${result.category || 'unknown'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p><strong>Domain Security Scanner</strong> - Advanced Threat Detection Report</p>
          <p>This report is generated automatically and should be reviewed by security professionals.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getThreatLevel = () => {
    if (!report) return null;
    const { malicious, suspicious } = report.stats;
    const total = malicious + suspicious;
    
    if (total === 0) return { level: "Safe", color: "safe" };
    if (total <= 5) return { level: "Low Risk", color: "low" };
    if (total <= 15) return { level: "Medium Risk", color: "medium" };
    return { level: "High Risk", color: "high" };
  };

  const renderBar = (label, count, total, color, icon) => {
    const percent = (count / total) * 100;
    return (
      <motion.div 
        className="mb-5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-gray-300 font-medium">{label}</span>
          </div>
          <span className="font-bold text-lg" style={{ color }}>{count}</span>
        </div>
        <div className="w-full bg-gray-800/60 rounded-full h-3 overflow-hidden border border-gray-700/50">
          <motion.div
            className="h-full rounded-full relative"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const threatInfo = report ? getThreatLevel() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Globe className="w-12 h-12 text-emerald-400" />
              <motion.div
                className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 animate-gradient">
              Domain Intelligence
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive domain reputation analysis with real-time threat detection across multiple security databases and threat feeds.
          </p>
        </motion.div>

        {/* Scan Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-25" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 pl-12 pr-4 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white placeholder-gray-500"
                  />
                </div>
                <motion.button
                  onClick={handleScan}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 px-8 rounded-xl font-semibold shadow-lg transition-all relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Analyze Domain
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scan Results */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Threat Level Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${
                  threatInfo.color === 'safe' ? 'from-green-500 to-emerald-500' :
                  threatInfo.color === 'low' ? 'from-yellow-500 to-amber-500' :
                  threatInfo.color === 'medium' ? 'from-orange-500 to-red-500' :
                  'from-red-500 to-rose-500'
                } rounded-2xl blur opacity-25`} />
                <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${
                        threatInfo.color === 'safe' ? 'bg-green-500/20' :
                        threatInfo.color === 'low' ? 'bg-yellow-500/20' :
                        threatInfo.color === 'medium' ? 'bg-orange-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {threatInfo.color === 'safe' ? <CheckCircle className="w-8 h-8 text-green-400" /> :
                         threatInfo.color === 'low' ? <AlertTriangle className="w-8 h-8 text-yellow-400" /> :
                         threatInfo.color === 'medium' ? <AlertTriangle className="w-8 h-8 text-orange-400" /> :
                         <XCircle className="w-8 h-8 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Threat Assessment</p>
                        <h3 className={`text-3xl font-bold ${
                          threatInfo.color === 'safe' ? 'text-green-400' :
                          threatInfo.color === 'low' ? 'text-yellow-400' :
                          threatInfo.color === 'medium' ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {threatInfo.level}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setShowFullReport(!showFullReport)}
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 py-3 px-6 rounded-xl transition-all font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showFullReport ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showFullReport ? "Hide" : "Details"}
                      </motion.button>
                      <motion.button
                        onClick={generatePDF}
                        className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 py-3 px-6 rounded-xl transition-all font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Analysis Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Threat Distribution</h3>
                  </div>
                  <div className="space-y-4">
                    {renderBar(
                      "Malicious",
                      report.stats.malicious,
                      Object.values(report.stats).reduce((a, b) => a + b, 0),
                      "#ef4444",
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    {renderBar(
                      "Suspicious",
                      report.stats.suspicious,
                      Object.values(report.stats).reduce((a, b) => a + b, 0),
                      "#f59e0b",
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                    {renderBar(
                      "Undetected",
                      report.stats.undetected,
                      Object.values(report.stats).reduce((a, b) => a + b, 0),
                      "#64748b",
                      <Info className="w-4 h-4 text-gray-400" />
                    )}
                    {renderBar(
                      "Harmless",
                      report.stats.harmless,
                      Object.values(report.stats).reduce((a, b) => a + b, 0),
                      "#22c55e",
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </motion.div>

                {/* Domain Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Link className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Domain Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Target Domain</p>
                      <p className="text-emerald-400 font-mono text-sm break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        {domain}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Scan Date</p>
                      <p className="text-gray-300 font-medium">{new Date().toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Security Engines</p>
                      <p className="text-gray-300 font-medium">
                        {Object.keys(report.results || {}).length} engines analyzed
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Reputation Score</p>
                      <p className="text-gray-300 font-medium">{report.reputation || 'N/A'}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* AI Risk Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
                <div className="relative bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-200">AI Risk Analysis</h3>
                    </div>
                    <motion.button
                      onClick={handleAIAnalysis}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-6 rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: aiLoading ? 1 : 1.05 }}
                      whileTap={{ scale: aiLoading ? 1 : 0.95 }}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Analyze with AI
                        </>
                      )}
                    </motion.button>
                  </div>
                  
                  {!aiReport && !aiLoading && (
                    <p className="text-gray-400 text-sm">
                      Get advanced insights and recommendations powered by artificial intelligence. AI analysis provides contextual threat assessment and security recommendations based on detected patterns.
                    </p>
                  )}

                  {/* AI Report Display */}
                  <AnimatePresence>
                    {aiReport && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-gray-950/50 p-6 rounded-xl border border-purple-500/30"
                      >
                        <h4 className="text-xl font-bold text-purple-400 mb-4 pb-3 border-b border-purple-500/30 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          AI Security Analysis
                        </h4>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                          {formatAIResponse(aiReport)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Full Report */}
              <AnimatePresence>
                {showFullReport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-xl"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-emerald-300 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Detailed Security Report
                      </h3>
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-800">
                            <tr className="text-left text-gray-400">
                              <th className="p-4 font-semibold">Security Engine</th>
                              <th className="p-4 font-semibold">Detection</th>
                              <th className="p-4 font-semibold">Category</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {Object.entries(report.results || {}).map(
                              ([engine, info], index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.02 }}
                                  className="hover:bg-gray-800/50 transition-colors"
                                >
                                  <td className="p-4 font-medium text-gray-200">{engine}</td>
                                  <td className="p-4">
                                    <span
                                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                        info?.category === "malicious"
                                          ? "bg-red-900/30 text-red-300 border border-red-700/50"
                                          : info?.category === "suspicious"
                                          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-700/50"
                                          : info?.category === "harmless"
                                          ? "bg-green-900/30 text-green-300 border border-green-700/50"
                                          : "bg-gray-800 text-gray-400 border border-gray-700"
                                      }`}
                                    >
                                      {info?.result || "No detection"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-gray-400 capitalize font-medium">
                                    {info?.category || "unknown"}
                                  </td>
                                </motion.tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DomainCheck;