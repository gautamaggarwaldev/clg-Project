import React, { useState, useCallback } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

const HashReport = () => {
  const [file, setFile] = useState(null);
  const [hashInput, setHashInput] = useState("");
  const [hashes, setHashes] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/csv": [".csv"],
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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("File Hash Scan Report", 20, 20);

    doc.setFontSize(14);
    doc.text("File Information:", 20, 40);
    autoTable(doc, {
      startY: 45,
      head: [["Property", "Value"]],
      body: [
        ["File Name", file?.name || "N/A"],
        ["File Size", file ? `${(file.size / 1024).toFixed(2)} KB` : "N/A"],
        ["MD5", hashes.md5 || "N/A"],
        ["SHA-1", hashes.sha1 || "N/A"],
        ["SHA-256", hashes.sha256 || "N/A"],
      ],
    });

    doc.setFontSize(14);
    doc.text("Scan Results Summary:", 20, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Category", "Count"]],
      body: Object.entries(report.status || {}).map(([key, val]) => [key, val]),
    });

    const riskPercentage = calculateRisk(report.status);
    doc.setFontSize(14);
    doc.text(
      `Risk Assessment: ${riskPercentage}% (${getRiskLevel(riskPercentage)})`,
      20,
      doc.lastAutoTable.finalY + 15
    );

    doc.setFontSize(14);
    doc.text("Detailed Scan Results:", 20, doc.lastAutoTable.finalY + 25);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [["Engine", "Category", "Result", "Version", "Update"]],
      body: Object.entries(report.results || {}).map(([engine, info]) => [
        engine,
        info.category,
        info.result || "N/A",
        info.engine_version || "N/A",
        info.engine_update || "N/A",
      ]),
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      margin: { horizontal: 5 },
      styles: { fontSize: 8 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
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

    doc.save(`hash-report-${hashInput}.pdf`);
    toast.success("PDF report downloaded!");
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            File Hash Scanner & Report
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload files to generate hashes or scan existing hashes for security threats
          </p>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">
            Upload File to Generate Hash
          </h2>

          {/* Drag and Drop Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-all ${
              isDragActive
                ? "border-cyan-500 bg-cyan-900/10"
                : "border-gray-600 hover:border-cyan-400 hover:bg-gray-800/30"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-3 bg-cyan-900/20 rounded-full"
              >
                <svg
                  className="w-10 h-10 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </motion.div>
              {isDragActive ? (
                <p className="text-cyan-400">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-gray-300">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported formats: PDF, DOCX, CSV
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
                accept=".pdf,.docx,.csv"
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
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
            >
              <h3 className="font-semibold text-cyan-300 mb-3">File Hashes:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 font-medium">MD5</p>
                  <p className="break-all font-mono text-sm">{hashes.md5}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 font-medium">SHA-1</p>
                  <p className="break-all font-mono text-sm">{hashes.sha1}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 font-medium">SHA-256</p>
                  <p className="break-all font-mono text-sm">{hashes.sha256}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Hash Input Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
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
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                "Scan Hash"
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Scan Results */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden mb-8"
            >
              <div className="p-6 md:p-8">
                {/* Report Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                      Scan Results
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Scanned on {new Date(report.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDetails(!showDetails)}
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
                      {showDetails ? "Hide Details" : "Show Details"}
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
                  </div>
                </div>

                {/* Risk Level */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Risk Assessment</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRiskColor(
                        calculateRisk(report.status)
                      )}`}
                    >
                      {calculateRisk(report.status)}% -{" "}
                      {getRiskLevel(calculateRisk(report.status))}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${calculateRisk(report.status)}%`,
                      }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${getRiskColor(
                        calculateRisk(report.status)
                      )}`}
                    />
                  </div>
                </div>

                {/* Stats Visualization */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Detection Breakdown
                  </h3>
                  {renderStatsBar()}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                    {[
                      { name: "malicious", color: "bg-red-600" },
                      { name: "suspicious", color: "bg-orange-500" },
                      { name: "harmless", color: "bg-green-500" },
                      { name: "undetected", color: "bg-gray-400" },
                      { name: "timeout", color: "bg-yellow-400" },
                      { name: "failure", color: "bg-purple-500" },
                      { name: "type-unsupported", color: "bg-blue-400" },
                    ].map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${cat.color}`}
                        ></div>
                        <span className="capitalize">
                          {cat.name.replace("-", " ")}:{" "}
                          {report.status[cat.name] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Info */}
                <div className="mb-6 bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                  <h3 className="text-xl font-semibold mb-3 text-cyan-300">
                    File Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">SHA-256</p>
                      <p className="break-all font-mono text-sm">
                        {report.file_info.sha256}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">MD5</p>
                      <p className="break-all font-mono text-sm">
                        {report.file_info.md5}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">SHA-1</p>
                      <p className="break-all font-mono text-sm">
                        {report.file_info.sha1}
                      </p>
                    </div>
                    {file && (
                      <div className="md:col-span-3">
                        <p className="text-sm text-gray-400">File Name</p>
                        <p>{file.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Results */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                          Detailed Scan Results
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Engine
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Result
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Version
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Update
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                              {Object.entries(report.results || {}).map(
                                ([engine, info]) => (
                                  <motion.tr
                                    key={engine}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="hover:bg-gray-700/30"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">
                                      {engine}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          info.category === "malicious"
                                            ? "bg-red-900 text-red-200"
                                            : info.category === "suspicious"
                                            ? "bg-orange-900 text-orange-200"
                                            : info.category === "harmless"
                                            ? "bg-green-900 text-green-200"
                                            : info.category === "undetected"
                                            ? "bg-gray-700 text-gray-300"
                                            : info.category === "timeout"
                                            ? "bg-yellow-900 text-yellow-200"
                                            : info.category === "failure"
                                            ? "bg-purple-900 text-purple-200"
                                            : "bg-blue-900 text-blue-200"
                                        }`}
                                      >
                                        {info.category}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {info.result || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {info.engine_version || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {info.engine_update || "N/A"}
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

export default HashReport;