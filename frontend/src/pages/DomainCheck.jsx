import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AIDomainReport from "../components/AiDomainReport";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
    },
  },
};

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
  const [showDetail, setShowDetail] = useState(false);

  const handleScan = async () => {
    console.log("handleScan called with domain:", domain); // Debug log

    if (!domain.trim()) {
      console.log("Domain is empty"); // Debug log
      toast.error("Please enter a domain.");
      return;
    }

    setLoading(true);
    console.log("Loading state set to true"); // Debug log

    try {
      console.log("Starting scan for domain:", domain); // Debug log

      // Clean domain input - remove protocol and trailing slashes
      const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      console.log("Clean domain:", cleanDomain); // Debug log

      const apiUrl = `http://localhost:5005/v1/domain/report/${cleanDomain}`; 
      // const apiUrl = `https://cs-qhmx.onrender.com/v1/domain/report/${cleanDomain}`; 
      console.log("API URL:", apiUrl); // Debug log

      const { data } = await axios.get(apiUrl, {
        timeout: 30000, // Increased timeout to 30 seconds
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API response:", data); // Debug log

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

        console.log("Setting report data:", reportData); // Debug log
        setReport(reportData);
        toast.success("Domain scanned successfully!");
      } else {
        throw new Error(data?.message || "Failed to fetch domain report");
      }
    } catch (err) {
      console.error("Scan error:", err); // Detailed error logging

      let errorMessage = "Something went wrong while scanning.";
      if (err.response) {
        // Server responded with error status
        console.error("Server error response:", err.response);
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        console.error("No response from server:", err.request);
        errorMessage = "No response from server. Please check if the server is running and try again.";
      } else if (err.message) {
        // Other errors
        console.error("Error message:", err.message);
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setReport(null); // Clear any previous report
    } finally {
      console.log("Setting loading to false"); // Debug log
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    console.log("Key pressed:", e.key); // Debug log
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  const generatePDF = () => {
    if (!report) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(`Domain Report: ${domain}`, 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Category", "Count"]],
      body: Object.entries(report.stats).map(([key, val]) => [key, val]),
      styles: { textColor: [50, 50, 50] },
      headStyles: { fillColor: [0, 204, 204] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Engine", "Category", "Result"]],
      body: Object.entries(report.results || {}).map(([engine, info]) => [
        engine,
        info?.category || "undetected",
        info?.result || "unknown",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 255] },
    });

    // Footer + Watermark
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(40);
      doc.setTextColor(200);
      doc.setGState(new doc.GState({ opacity: 0.4 }));
      doc.text(
        "GG's Security",
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height / 2,
        { angle: 45, align: "center" }
      );
      doc.setGState(new doc.GState({ opacity: 1 }));
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "GG's Security | email: ggkisuraksha@email.com | phone: +91 78899555",
        20,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`domain-report-${domain}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Domain Security Scanner
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Analyze any domain for security threats, malware, and reputation
            data
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="w-full max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => {
                  console.log("Input changed:", e.target.value); // Debug log
                  setDomain(e.target.value);
                }}
                placeholder="Enter domain (e.g., example.com)"
                className="flex-1 p-4 rounded-xl bg-gray-800 border-2 border-blue-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 focus:outline-none transition-all duration-300"
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={(e) => {
                  console.log("Button clicked", e); // Debug log
                  e.preventDefault();
                  e.stopPropagation();
                  handleScan();
                }}
                disabled={loading}
                style={{ zIndex: 10, pointerEvents: loading ? 'none' : 'auto' }}
                className={`px-6 py-4 rounded-xl font-medium whitespace-nowrap ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer"
                } shadow-lg transition-all duration-300 border-0`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  "Scan Domain"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {report && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-2xl border border-blue-500 shadow-xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-4 md:mb-0"
                  >
                    Scan Summary: <span className="text-white">{domain}</span>
                  </motion.h2>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDetail(!showDetail)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {showDetail ? "Hide Details" : "View Details"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generatePDF}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download PDF
                    </motion.button>
                  </motion.div>
                </div>

                {/* Risk Level */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      Security Risk Assessment
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                        calculateRisk(report.stats)
                      ).replace("bg-gradient-to-r", "bg")}`}
                    >
                      {calculateRisk(report.stats)}% Risk
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateRisk(report.stats)}%` }}
                      transition={{ duration: 1, type: "spring" }}
                      className={`h-full rounded-full ${getRiskColor(
                        calculateRisk(report.stats)
                      )}`}
                    />
                  </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                >
                  {Object.entries(report.stats).map(([key, value]) => (
                    <motion.div
                      key={key}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className={`p-4 rounded-xl ${
                        key === "malicious"
                          ? "bg-red-900 bg-opacity-50 border border-red-500"
                          : key === "suspicious"
                          ? "bg-orange-900 bg-opacity-50 border border-orange-500"
                          : "bg-gray-700 bg-opacity-50 border border-gray-600"
                      } shadow-md`}
                    >
                      <div className="text-sm text-gray-300 capitalize">
                        {key}
                      </div>
                      <div className="text-2xl font-bold mt-1">{value}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Domain Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 bg-gray-700 bg-opacity-30 p-6 rounded-xl border border-gray-600"
                >
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    Domain Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Creation Date:</span>{" "}
                        <span className="font-medium">
                          {report.creation_date ? 
                            new Date(report.creation_date * 1000).toLocaleString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Update:</span>{" "}
                        <span className="font-medium">
                          {report.last_update_date ?
                            new Date(report.last_update_date * 1000).toLocaleString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Reputation:</span>{" "}
                        <span className="font-medium">{report.reputation || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">TLD:</span>{" "}
                        <span className="font-medium">{report.tld || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* AI Report Section */}
                {report && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                  >
                    <AIDomainReport domainData={report} />
                  </motion.div>
                )}

                {/* Detailed Report */}
                <AnimatePresence>
                  {showDetail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Detailed Engine Analysis
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                  Engine
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                  Result
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                              {Object.entries(report.results || {}).map(
                                ([engine, info]) => (
                                  <tr
                                    key={engine}
                                    className="hover:bg-gray-700 transition-colors"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">
                                      {engine}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          info?.category === "malicious"
                                            ? "bg-red-900 text-red-100"
                                            : info?.category === "suspicious"
                                            ? "bg-orange-900 text-orange-100"
                                            : "bg-gray-600 text-gray-100"
                                        }`}
                                      >
                                        {info?.category || "undetected"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                      {info?.result || "unknown"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DomainCheck;