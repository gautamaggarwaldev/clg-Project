import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Download, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp } from "lucide-react";

const DarkWebScanner = () => {
  const [email, setEmail] = useState("");
  const [breachData, setBreachData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFullReport, setShowFullReport] = useState(false);

  const handleScan = async () => {
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }

    setLoading(true);
    setError("");
    setBreachData(null);
    setShowFullReport(false);

    try {
      const res = await axios.post(
        // "http://localhost:5005/v1/dark-web-scanner/check-breach",
        "https://cs-qhmx.onrender.com/v1/dark-web-scanner/check-breach",
        { email }
      );
      setBreachData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while checking the email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  const generatePDF = async () => {
  if (!breachData) return;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText("Dark Web Security Scan Report", {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });

    page.drawText(`Generated on ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 80,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Scan Information
    page.drawText("Scan Information", {
      x: 50,
      y: height - 120,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Email Address: ${breachData.email}`, {
      x: 50,
      y: height - 150,
      size: 12,
      font,
    });

    page.drawText(`Scan Date: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 170,
      size: 12,
      font,
    });

    page.drawText(`Status: ${breachData.found ? "COMPROMISED" : "SECURE"}`, {
      x: 50,
      y: height - 190,
      size: 12,
      font: boldFont,
      color: breachData.found ? rgb(0.9, 0.2, 0.2) : rgb(0.2, 0.7, 0.2),
    });

    page.drawText(`Breaches Found: ${breachData.found ? breachData.results.length : 0}`, {
      x: 50,
      y: height - 210,
      size: 12,
      font,
    });

    // Threat Assessment
    page.drawText("Threat Assessment", {
      x: 50,
      y: height - 250,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    let yPosition = height - 280;

    if (breachData.found) {
      page.drawText("HIGH RISK - Your email has been compromised in data breaches", {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.9, 0.2, 0.2),
      });
      yPosition -= 25;

      page.drawText(`Found ${breachData.results.length} breach instances across various sources.`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 40;

      // Breach Details
      page.drawText("Breach Details", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 25;

      breachData.results.forEach((result, index) => {
        if (yPosition < 100) {
          page.drawText("Continued on next page...", {
            x: 50,
            y: 50,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          yPosition = height - 50;
          pdfDoc.addPage([600, 800]);
        }

        page.drawText(`Breach #${index + 1}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0.9, 0.2, 0.2),
        });
        yPosition -= 15;

        page.drawText(`Source: ${result.sources || "Unknown"}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;

        if (result.password) {
          page.drawText(`Password Exposed: ${"•".repeat(12)}`, {
            x: 70,
            y: yPosition,
            size: 10,
            font,
            color: rgb(0.9, 0.2, 0.2),
          });
          yPosition -= 15;
        }

        if (result.sha1) {
          page.drawText(`SHA1: ${result.sha1}`, {
            x: 70,
            y: yPosition,
            size: 8,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
          yPosition -= 12;
        }

        if (result.hash) {
          page.drawText(`Hash: ${result.hash}`, {
            x: 70,
            y: yPosition,
            size: 8,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
          yPosition -= 12;
        }
        yPosition -= 10;
      });
    } else {
      // FIXED: Removed the emoji
      page.drawText("LOW RISK - No breaches found", {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.7, 0.2),
      });
      yPosition -= 25;

      page.drawText("Your email address does not appear in any known data breaches.", {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 40;
    }

    // Security Recommendations
    page.drawText("Security Recommendations", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 25;

    const recommendations = [
      "• Use strong, unique passwords for each account",
      "• Enable two-factor authentication (2FA) where available",
      "• Regularly monitor your accounts for suspicious activity",
      "• Consider using a password manager",
      "• Avoid reusing passwords across different services",
      "• Be cautious of phishing attempts and suspicious emails"
    ];

    recommendations.forEach(rec => {
      if (yPosition < 100) {
        page.drawText("Continued on next page...", {
          x: 50,
          y: 50,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
        yPosition = height - 50;
        pdfDoc.addPage([600, 800]);
      }
      
      page.drawText(rec, {
        x: 70,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
    });

    // Footer - FIXED ROTATE PARAMETER
    const pages = pdfDoc.getPages();
    pages.forEach((pg, index) => {
      // Watermark - FIXED: Use degrees instead of radians
      pg.drawText("DARK WEB SCAN", {
        x: 300,
        y: 400,
        size: 60,
        font: boldFont,
        color: rgb(0.95, 0.95, 0.95),
        rotate: { type: 'degrees', angle: 45 }, // Fixed rotation
        opacity: 0.1,
      });

      // Footer text on last page
      if (index === pages.length - 1) {
        pg.drawText(
          "Dark Web Scanner - Security Intelligence Report | Generated automatically for security purposes",
          {
            x: 50,
            y: 30,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          }
        );
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(
      blob,
      `dark-web-scan-${email.replace(/[@.]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
    );
  } catch (err) {
    console.error("Error generating PDF:", err);
    setError("Failed to generate PDF report.");
  }
};

  const getThreatLevel = () => {
    if (!breachData) return null;
    
    if (breachData.found) {
      const breachCount = breachData.results.length;
      if (breachCount > 10) return { level: "Critical Risk", color: "red" };
      if (breachCount > 5) return { level: "High Risk", color: "orange" };
      if (breachCount > 2) return { level: "Medium Risk", color: "yellow" };
      return { level: "Low Risk", color: "yellow" };
    }
    return { level: "Secure", color: "green" };
  };

  const threatInfo = breachData ? getThreatLevel() : null;

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

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
              <Mail className="w-12 h-12 text-violet-400" />
              <motion.div
                className="absolute inset-0 bg-violet-400/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-400 animate-gradient">
              Dark Web Monitor
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor dark web marketplaces and forums for compromised credentials, leaked data, and potential security breaches.
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
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-25" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-violet-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address to scan..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 pl-12 pr-4 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all text-white placeholder-gray-500"
                  />
                </div>
                <motion.button
                  onClick={handleScan}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-4 px-8 rounded-xl font-semibold shadow-lg transition-all relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Scan Dark Web
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan Results */}
        <AnimatePresence>
          {breachData && (
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
                  threatInfo.color === 'green' ? 'from-green-500 to-emerald-500' :
                  threatInfo.color === 'yellow' ? 'from-yellow-500 to-amber-500' :
                  threatInfo.color === 'orange' ? 'from-orange-500 to-red-500' :
                  'from-red-500 to-rose-500'
                } rounded-2xl blur opacity-25`} />
                <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${
                        threatInfo.color === 'green' ? 'bg-green-500/20' :
                        threatInfo.color === 'yellow' ? 'bg-yellow-500/20' :
                        threatInfo.color === 'orange' ? 'bg-orange-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {threatInfo.color === 'green' ? <CheckCircle className="w-8 h-8 text-green-400" /> :
                         threatInfo.color === 'yellow' ? <AlertTriangle className="w-8 h-8 text-yellow-400" /> :
                         threatInfo.color === 'orange' ? <AlertTriangle className="w-8 h-8 text-orange-400" /> :
                         <XCircle className="w-8 h-8 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Threat Assessment</p>
                        <h3 className={`text-3xl font-bold ${
                          threatInfo.color === 'green' ? 'text-green-400' :
                          threatInfo.color === 'yellow' ? 'text-yellow-400' :
                          threatInfo.color === 'orange' ? 'text-orange-400' :
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
                {/* Scan Summary Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Scan Summary</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email Address</span>
                      <span className="text-violet-400 font-mono text-sm">{breachData.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Scan Date</span>
                      <span className="text-gray-300">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-semibold ${
                        breachData.found ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {breachData.found ? 'Compromised' : 'Secure'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Breaches Found</span>
                      <span className={`font-bold ${
                        breachData.found ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {breachData.found ? breachData.results.length : 0}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Security Status Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-violet-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Security Status</h3>
                  </div>
                  <div className="space-y-4">
                    {breachData.found ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold">Immediate Action Required</span>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-2">
                          <li>• Change passwords for affected accounts</li>
                          <li>• Enable two-factor authentication</li>
                          <li>• Monitor financial accounts</li>
                          <li>• Consider credit monitoring</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">No Immediate Threats</span>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-2">
                          <li>• Continue security best practices</li>
                          <li>• Use unique passwords</li>
                          <li>• Enable 2FA where available</li>
                          <li>• Regular security monitoring</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Full Report */}
              <AnimatePresence>
                {showFullReport && breachData.found && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-xl"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-violet-300 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Detailed Breach Report
                      </h3>
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-800">
                            <tr className="text-left text-gray-400">
                              <th className="p-4 font-semibold">Source</th>
                              <th className="p-4 font-semibold">Password Status</th>
                              <th className="p-4 font-semibold">SHA1 Hash</th>
                              <th className="p-4 font-semibold">Additional Hash</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {breachData.results.map((result, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="hover:bg-gray-800/50 transition-colors"
                              >
                                <td className="p-4 font-medium text-gray-200">
                                  {result.sources || "Unknown Source"}
                                </td>
                                <td className="p-4">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                    result.password
                                      ? "bg-red-900/30 text-red-300 border border-red-700/50"
                                      : "bg-gray-800 text-gray-400 border border-gray-700"
                                  }`}>
                                    {result.password ? "Password Exposed" : "No Password"}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-400 font-mono text-xs">
                                  {result.sha1 || "N/A"}
                                </td>
                                <td className="p-4 text-gray-400 font-mono text-xs">
                                  {result.hash || "N/A"}
                                </td>
                              </motion.tr>
                            ))}
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

export default DarkWebScanner;