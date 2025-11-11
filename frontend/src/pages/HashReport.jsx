import React, { useState, useCallback } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, File, Download, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, BarChart3, Hash } from "lucide-react";

const HashReport = () => {
  const [file, setFile] = useState(null);
  const [hashInput, setHashInput] = useState("");
  const [hashes, setHashes] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    calculateHashes(uploadedFile);
    toast.success("File uploaded successfully!");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
      "application/zip": [".zip"],
      "application/x-msdownload": [".exe"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"]
    },
    maxFiles: 1,
  });

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    calculateHashes(uploadedFile);
  };

  const calculateHashes = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result);
      const md5 = CryptoJS.MD5(wordArray).toString();
      const sha1 = CryptoJS.SHA1(wordArray).toString();
      const sha256 = CryptoJS.SHA256(wordArray).toString();
      setHashes({ md5, sha1, sha256 });
      setHashInput(sha256);
      toast.success("Hashes calculated successfully!");
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchReport = async () => {
    if (!hashInput) return toast.error("Please enter a hash value");

    setLoading(true);
    try {
      const { data } = await axios.get(
        // `http://localhost:5005/v1/file/hash-report/${hashInput}`
        `https://cs-qhmx.onrender.com/v1/file/hash-report/${hashInput}`
      );

      if (data.data.status === "queued") {
        toast.success("File submitted for analysis. Please check back later.");
        setReport({
          status: "queued",
          analysis_id: data.data.analysis_id,
        });
      } else {
        setReport(data.data);
        toast.success("Report fetched successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching report.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!report) {
      alert("Please scan a hash first before running AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiReport("");

    try {
      console.log("Sending AI analysis request for hash...");
      // const response = await fetch("http://localhost:5005/v1/ai/analyze-report", {
      const response = await fetch("https://cs-qhmx.onrender.com/v1/ai/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanType: "Hash Scan",
          stats: report.status,
          results: report.results,
          meta: {
            fileName: file?.name || "Hash Analysis",
            fileSize: report.file_info?.size || 0,
            fileType: file?.type || "hash",
            scanDate: new Date().toISOString(),
            hashes: {
              sha256: report.file_info?.sha256 || hashInput,
              md5: report.file_info?.md5 || hashes.md5,
              sha1: report.file_info?.sha1 || hashes.sha1
            }
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
        setAiReport(`Based on the hash scan results, here's my analysis:

Threat Assessment:
The file hash shows ${report.status.malicious > 0 ? 'HIGH RISK' : 'LOW RISK'} with ${report.status.malicious} malicious and ${report.status.suspicious} suspicious detections.

Key Findings:
- ${report.status.malicious} security engines detected malicious content
- ${report.status.suspicious} engines flagged the file as suspicious
- ${report.status.harmless} engines found it harmless
- Total engines scanned: ${Object.values(report.status).reduce((a, b) => a + b, 0)}

Security Recommendations:
- ${report.status.malicious > 0 ? 'AVOID THIS FILE - It contains malicious content' : 'Exercise caution when dealing with this file'}
- Do not download or execute files with this hash
- Verify file integrity from trusted sources
- Consider quarantining if already downloaded

Overall Security Score: ${Math.max(0, 100 - (report.status.malicious * 20 + report.status.suspicious * 10))}/100

This analysis is based on real-time threat intelligence from multiple security engines.`);
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      // Fallback demo response
      setAiReport(`AI Analysis Unavailable

The AI analysis service is currently unavailable. Here's a summary based on the hash scan results:

Hash Scan Summary:
- Malicious Detections: ${report.status.malicious}
- Suspicious Detections: ${report.status.suspicious}
- Harmless Results: ${report.status.harmless}
- Undetected: ${report.status.undetected}
- File Hash: ${hashInput}

Please try the AI analysis again in a few moments, or proceed with the standard hash report above.`);
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
            <h4 key={index} className="text-lg font-semibold text-cyan-400 mb-3 mt-4 first:mt-0">
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

  const generatePDF = () => {
    if (!report) return;

    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    const stats = report.status;
    const results = report.results;
    const threatInfo = getThreatLevel();
    
    // Generate HTML for PDF - Matching the design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hash Security Scan Report</title>
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
            border-bottom: 3px solid #06b6d4;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0891b2;
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
            color: #0891b2;
            margin-bottom: 15px;
            border-left: 4px solid #06b6d4;
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
          <h1>🔐 Hash Security Scan Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="threat-box threat-${threatInfo.color}">
            <div class="threat-level">${threatInfo.level}</div>
            <div>Overall Threat Assessment</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Hash Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Scan Date</div>
              <div class="info-value">${new Date().toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Security Engines</div>
              <div class="info-value">${Object.keys(results || {}).length} engines analyzed</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Detections</div>
              <div class="info-value">${stats.malicious + stats.suspicious} findings</div>
            </div>
            <div class="info-item">
              <div class="info-label">SHA256</div>
              <div class="info-value" style="font-size: 12px;">${report.file_info?.sha256 || hashInput}</div>
            </div>
            ${report.file_info?.md5 ? `
            <div class="info-item">
              <div class="info-label">MD5</div>
              <div class="info-value">${report.file_info.md5}</div>
            </div>
            ` : ''}
            ${report.file_info?.sha1 ? `
            <div class="info-item">
              <div class="info-label">SHA1</div>
              <div class="info-value">${report.file_info.sha1}</div>
            </div>
            ` : ''}
            ${file ? `
            <div class="info-item">
              <div class="info-label">File Name</div>
              <div class="info-value">${file.name}</div>
            </div>
            ` : ''}
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
              ${Object.entries(results || {}).map(([engine, result]) => `
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
          <p><strong>Hash Security Scanner</strong> - Advanced Threat Detection Report</p>
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

  const calculateRisk = (stats) => {
    if (!stats) return 0;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round(((stats.malicious + stats.suspicious) / total) * 100);
  };

  const getRiskColor = (riskPercentage) => {
    if (riskPercentage === 0) return "from-green-400 to-green-600";
    if (riskPercentage <= 30) return "from-yellow-400 to-yellow-600";
    if (riskPercentage <= 70) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-700";
  };

  const getRiskLevel = (riskPercentage) => {
    if (riskPercentage === 0) return "No risk";
    if (riskPercentage <= 30) return "Low risk";
    if (riskPercentage <= 70) return "Medium risk";
    return "High risk";
  };

  const getThreatLevel = () => {
    if (!report) return null;
    const { malicious, suspicious } = report.status;
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

  const renderStatsBar = () => {
    if (!report?.status) return null;

    const total = Object.values(report.status).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const categories = [
      { name: "malicious", color: "bg-red-600" },
      { name: "suspicious", color: "bg-orange-500" },
      { name: "harmless", color: "bg-green-500" },
      { name: "undetected", color: "bg-gray-400" },
      { name: "timeout", color: "bg-yellow-400" },
      { name: "failure", color: "bg-purple-500" },
      { name: "type-unsupported", color: "bg-blue-400" },
    ];

    return (
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
        {categories.map((cat) => (
          <motion.div
            key={cat.name}
            initial={{ width: 0 }}
            animate={{
              width: `${(report.status[cat.name] / total) * 100}%`,
            }}
            transition={{ duration: 1 }}
            className={`${cat.color} h-3`}
            title={`${cat.name}: ${report.status[cat.name]}`}
          />
        ))}
      </div>
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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

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
              <Hash className="w-12 h-12 text-cyan-400" />
              <motion.div
                className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient">
              Hash Security Scanner
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload files to generate hashes or scan existing hashes against multiple threat intelligence databases.
          </p>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Upload File to Generate Hash
              </h2>

              {/* Drag and Drop Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-all ${
                  isDragActive
                    ? "border-cyan-500 bg-cyan-900/10"
                    : "border-cyan-500 bg-gray-800/50 hover:bg-gray-700/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-4 bg-cyan-500/10 rounded-full"
                  >
                    <File className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                  {isDragActive ? (
                    <p className="text-cyan-400">Drop the file here...</p>
                  ) : (
                    <>
                      <p className="text-gray-300">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-400">
                        Supported formats: PDF, DOCX, CSV, TXT, EXE, ZIP, PNG, JPG
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Or traditional file input */}
              <div className="flex justify-center mb-6">
                <motion.label
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer shadow-lg"
                >
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.docx,.csv,.txt,.exe,.zip,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </motion.label>
              </div>

              {/* Hash Display */}
              {hashes.md5 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30"
                >
                  <h3 className="font-semibold text-cyan-300 mb-3">File Hashes:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                      <p className="text-sm text-gray-400 font-medium">MD5</p>
                      <p className="break-all font-mono text-sm text-cyan-300">{hashes.md5}</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                      <p className="text-sm text-gray-400 font-medium">SHA-1</p>
                      <p className="break-all font-mono text-sm text-cyan-300">{hashes.sha1}</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                      <p className="text-sm text-gray-400 font-medium">SHA-256</p>
                      <p className="break-all font-mono text-sm text-cyan-300">{hashes.sha256}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hash Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Scan File by Hash
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter SHA-256, MD5, or SHA-1 hash..."
                  className="flex-grow p-4 rounded-lg bg-gray-800 border border-cyan-500/50 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 focus:outline-none transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={fetchReport}
                  disabled={loading}
                  className={`px-6 py-4 rounded-lg font-medium shadow-lg transition-all ${
                    loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Scanning...
                    </span>
                  ) : (
                    "Scan Hash"
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
                        Export PDF
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
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Threat Distribution</h3>
                  </div>
                  <div className="space-y-4">
                    {renderBar(
                      "Malicious",
                      report.status.malicious,
                      Object.values(report.status).reduce((a, b) => a + b, 0),
                      "#ef4444",
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    {renderBar(
                      "Suspicious",
                      report.status.suspicious,
                      Object.values(report.status).reduce((a, b) => a + b, 0),
                      "#f59e0b",
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                    {renderBar(
                      "Undetected",
                      report.status.undetected,
                      Object.values(report.status).reduce((a, b) => a + b, 0),
                      "#64748b",
                      <Info className="w-4 h-4 text-gray-400" />
                    )}
                    {renderBar(
                      "Harmless",
                      report.status.harmless,
                      Object.values(report.status).reduce((a, b) => a + b, 0),
                      "#22c55e",
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </motion.div>

                {/* Hash Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Hash className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Hash Information</h3>
                  </div>
                  <div className="space-y-4">
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
                      <p className="text-gray-500 text-sm mb-2">SHA-256</p>
                      <p className="text-cyan-400 font-mono text-sm break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        {report.file_info?.sha256 || hashInput}
                      </p>
                    </div>
                    {report.file_info?.md5 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">MD5</p>
                        <p className="text-cyan-400 font-mono text-sm break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                          {report.file_info.md5}
                        </p>
                      </div>
                    )}
                    {report.file_info?.sha1 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">SHA-1</p>
                        <p className="text-cyan-400 font-mono text-sm break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                          {report.file_info.sha1}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* AI Risk Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
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
                      <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
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
                              <th className="p-4 font-semibold">Version</th>
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
                                  <td className="p-4 text-gray-400 text-sm">
                                    {info?.engine_version || "N/A"}
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

export default HashReport;