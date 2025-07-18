import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AIRiskAnalysis from "../components/AiRiskAnalysis";

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
  if (risk > 70) return "from-red-600 to-red-800";
  if (risk > 30) return "from-yellow-500 to-orange-600";
  return "from-green-500 to-teal-600";
};

const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown";
  try {
    const date = new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
  } catch (e) {
    return "Invalid date";
  }
};

const IpCheck = () => {
  const [ip, setIp] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleScan = async () => {
    if (!ip.trim()) {
      toast.error("Please enter an IP address.");
      return;
    }

    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      toast.error("Please enter a valid IP address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        // `http://localhost:5005/v1/ip/report/${ip}`
        `https://cs-qhmx.onrender.com/v1/ip/report/${ip}`
      );

      if (data.success) {
        const ipData = data.data;
        if (!ipData || !ipData.attributes) {
          throw new Error("Invalid IP data structure received");
        }

        const stats =
          ipData.attributes.last_analysis_stats ||
          calculateStats(ipData.attributes.last_analysis_results);

        setReport({
          ...ipData.attributes,
          stats,
          results: ipData.attributes.last_analysis_results,
          ipInfo: {
            country: ipData.attributes.country,
            asn: ipData.attributes.asn,
            asOwner: ipData.attributes.as_owner,
            network: ipData.attributes.network,
            registry: ipData.attributes.regional_internet_registry,
          },
        });
        toast.success("IP address scanned successfully!");
      } else {
        toast.error(data.message || "Failed to fetch IP address report.");
      }
    } catch (err) {
      console.error("Scan Error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while scanning."
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!report) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(`IP Address Report: ${ip}`, 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Category", "Value"]],
      body: [
        ["IP Address", ip],
        ["Country", report.ipInfo.country || "Unknown"],
        ["ASN", report.ipInfo.asn || "Unknown"],
        ["Network", report.ipInfo.network || "Unknown"],
        ["Registry", report.ipInfo.registry || "Unknown"],
        ["AS Owner", report.ipInfo.asOwner || "Unknown"],
        ["Reputation", report.reputation || "Unknown"],
      ],
      styles: { textColor: [50, 50, 50] },
      headStyles: { fillColor: [0, 204, 204] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Category", "Count"]],
      body: Object.entries(report.stats).map(([key, val]) => [key, val]),
      styles: { textColor: [50, 50, 50] },
      headStyles: { fillColor: [100, 100, 255] },
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
      headStyles: { fillColor: [150, 150, 150] },
    });

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

    doc.save(`ip-report-${ip}.pdf`);
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
            IP Address Security Scanner
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Analyze any IP address for security threats, malicious activity, and
            reputation data
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="w-full p-4 pr-32 rounded-xl bg-gray-800 border-2 border-blue-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 focus:outline-none transition-all duration-300"
                onKeyPress={(e) => e.key === "Enter" && handleScan()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScan}
                disabled={loading}
                className={`absolute right-2 top-2 px-6 py-2 rounded-lg font-medium ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                } shadow-lg transition-all duration-300`}
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
                  "Scan IP"
                )}
              </motion.button>
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
                    Scan Summary: <span className="text-white">{ip}</span>
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
                    <h3 className="text-lg font-semibold">Threat Analysis</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRiskColor(
                        calculateRisk(report.stats)
                      )}`}
                    >
                      {calculateRisk(report.stats)}% Risk
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateRisk(report.stats)}%` }}
                      transition={{ duration: 1, type: "spring" }}
                      className={`h-full rounded-full bg-gradient-to-r ${getRiskColor(
                        calculateRisk(report.stats)
                      )}`}
                    />
                  </div>
                </motion.div>

                {/* Threat Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold mb-3">
                    Threat Distribution
                  </h3>
                  <div className="w-full bg-gray-700 rounded-full h-6 flex overflow-hidden shadow-inner">
                    {report.stats.malicious > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (report.stats.malicious /
                              Object.values(report.stats).reduce(
                                (a, b) => a + b,
                                0
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 0.6 }}
                        className="h-6 bg-red-600"
                        title={`Malicious: ${report.stats.malicious}`}
                      />
                    )}
                    {report.stats.suspicious > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (report.stats.suspicious /
                              Object.values(report.stats).reduce(
                                (a, b) => a + b,
                                0
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 0.7 }}
                        className="h-6 bg-orange-500"
                        title={`Suspicious: ${report.stats.suspicious}`}
                      />
                    )}
                    {report.stats.harmless > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (report.stats.harmless /
                              Object.values(report.stats).reduce(
                                (a, b) => a + b,
                                0
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 0.8 }}
                        className="h-6 bg-green-500"
                        title={`Harmless: ${report.stats.harmless}`}
                      />
                    )}
                    {report.stats.undetected > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (report.stats.undetected /
                              Object.values(report.stats).reduce(
                                (a, b) => a + b,
                                0
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 0.9 }}
                        className="h-6 bg-gray-500"
                        title={`Undetected: ${report.stats.undetected}`}
                      />
                    )}
                    {report.stats.timeout > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (report.stats.timeout /
                              Object.values(report.stats).reduce(
                                (a, b) => a + b,
                                0
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 1.0 }}
                        className="h-6 bg-yellow-500"
                        title={`Timeout: ${report.stats.timeout}`}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-red-500">
                      Malicious: {report.stats.malicious}
                    </span>
                    <span className="text-orange-500">
                      Suspicious: {report.stats.suspicious}
                    </span>
                    <span className="text-green-500">
                      Harmless: {report.stats.harmless}
                    </span>
                    <span className="text-gray-400">
                      Undetected: {report.stats.undetected}
                    </span>
                    <span className="text-yellow-500">
                      Timeout: {report.stats.timeout}
                    </span>
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

                {/* IP Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 bg-gray-700 bg-opacity-30 p-6 rounded-xl border border-gray-600"
                >
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    IP Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">IP Address:</span>{" "}
                        <span className="font-medium">{ip}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Country:</span>{" "}
                        <span className="font-medium">
                          {report.ipInfo.country || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">ASN:</span>{" "}
                        <span className="font-medium">
                          {report.ipInfo.asn || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Network:</span>{" "}
                        <span className="font-medium">
                          {report.ipInfo.network || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Registry:</span>{" "}
                        <span className="font-medium">
                          {report.ipInfo.registry || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">AS Owner:</span>{" "}
                        <span className="font-medium">
                          {report.ipInfo.asOwner || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reputation:</span>{" "}
                        <span className="font-medium">
                          {report.reputation || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Analysis:</span>{" "}
                        <span className="font-medium">
                          {formatDate(report.last_analysis_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* AI Analysis */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <AIRiskAnalysis
                    scanType="IP Scan"
                    stats={{
                      malicious: report.stats.malicious || 0,
                      suspicious: report.stats.suspicious || 0,
                      harmless: report.stats.harmless || 0,
                      undetected: report.stats.undetected || 0,
                      timeout: report.stats.timeout || 0,
                    }}
                    results={report.results}
                    meta={{
                      target: ip,
                      timestamp: new Date().toISOString(),
                      creationDate: report.creation_date,
                      lastUpdate: report.last_update_date,
                      reputation: report.reputation,
                      tld: report.tld,
                    }}
                  />
                </motion.div>

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
                                  <motion.tr
                                    key={engine}
                                    className="hover:bg-gray-700 transition-colors"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default IpCheck;
