import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Link as LinkIcon, Download, Eye, EyeOff, Loader2 } from "lucide-react";
import AIRiskAnalysis from "../components/AiRiskAnalysis";

const ScanURL = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState("");
  const [showFullReport, setShowFullReport] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setScanData(null);
    setError("");
    setShowFullReport(false);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        // "http://localhost:5005/v1/url/scan",
        "https://cs-qhmx.onrender.com/v1/url/scan",
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setScanData(res.data.data);
      toast.success("URL scanned successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to scan URL. Please try again.");
      toast.error("Scan failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // ... (keep your existing PDF generation code)
  };

  const renderBar = (label, count, total, color) => {
    const percent = (count / total) * 100;
    return (
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{label}</span>
          <span className="font-medium">{count}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            URL Security Scanner
          </h1>
          <p className="text-gray-400">
            Analyze any URL for potential security threats and vulnerabilities
          </p>
        </motion.div>

        {/* Scan Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-4 pl-10 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>
          <motion.button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Scan URL
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg"
            >
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan Results */}
        <AnimatePresence>
          {scanData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Summary Card */}
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
                whileHover={{ scale: 1.005 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-cyan-300 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Scan Summary
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                    {new Date().toLocaleString()}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-400 mb-1">Scanned URL:</p>
                  <p className="text-cyan-400 font-mono break-all">{scanData.url}</p>
                </div>

                {/* Threat Stats */}
                <div className="space-y-4 mb-8">
                  <h4 className="text-lg font-medium text-gray-300">Threat Analysis</h4>
                  {renderBar(
                    "Malicious",
                    scanData.scanResult.attributes.stats.malicious,
                    100,
                    "#ef4444"
                  )}
                  {renderBar(
                    "Suspicious",
                    scanData.scanResult.attributes.stats.suspicious,
                    100,
                    "#f59e0b"
                  )}
                  {renderBar(
                    "Undetected",
                    scanData.scanResult.attributes.stats.undetected,
                    100,
                    "#64748b"
                  )}
                  {renderBar(
                    "Harmless",
                    scanData.scanResult.attributes.stats.harmless,
                    100,
                    "#22c55e"
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    onClick={() => setShowFullReport(!showFullReport)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showFullReport ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Full Report
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </motion.button>
                </div>
              </motion.div>

              {/* AI Risk Analysis */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AIRiskAnalysis
                  scanType="URL Scan"
                  stats={scanData.scanResult.attributes.stats}
                  results={scanData.scanResult.attributes.results}
                  meta={{
                    url: scanData.url,
                    scanDate: new Date().toISOString(),
                  }}
                />
              </motion.div>

              {/* Full Report */}
              <AnimatePresence>
                {showFullReport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-800/70 border border-gray-700 rounded-xl overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                        Detailed Scan Results
                      </h3>
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-900 z-10">
                            <tr className="text-left text-gray-400 border-b border-gray-700">
                              <th className="p-3">Security Engine</th>
                              <th className="p-3">Result</th>
                              <th className="p-3">Category</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {Object.entries(scanData.scanResult.attributes.results).map(
                              ([engine, result], index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.02 }}
                                  className="hover:bg-gray-700/50"
                                >
                                  <td className="p-3 font-medium">{engine}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        result.category === "malicious"
                                          ? "bg-red-900/50 text-red-300"
                                          : result.category === "suspicious"
                                          ? "bg-yellow-900/50 text-yellow-300"
                                          : result.category === "harmless"
                                          ? "bg-green-900/50 text-green-300"
                                          : "bg-gray-700 text-gray-400"
                                      }`}
                                    >
                                      {result.result || "No result"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-gray-400 capitalize">
                                    {result.category || "unknown"}
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
    </motion.div>
  );
};

export default ScanURL;