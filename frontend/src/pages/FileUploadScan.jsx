import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { motion, AnimatePresence } from "framer-motion";
import AIRiskAnalysis from "../components/AiRiskAnalysis";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80
    }
  }
};

const FileUploadScan = () => {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isFileTypeValid(droppedFile)) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a valid file (PDF, DOCX, CSV)");
    }
  };

  const isFileTypeValid = (file) => {
    const validExtensions = [".pdf", ".docx", ".csv"];
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isFileTypeValid(selectedFile)) {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a valid file (PDF, DOCX, CSV)");
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please upload a file first.");
    setLoading(true);
    setReport(null);

    let toastId;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(
        // "https://cs-qhmx.onrender.com/v1/file/upload",
        "http://localhost:5005/v1/file/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const scanId = uploadRes?.data?.data?.scanId;
      if (!scanId) throw new Error("Scan ID not received from server");

      toastId = toast.loading("Scanning file... This may take a moment");

      let reportRes;
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 3000;

      while (attempts < maxAttempts) {
        try {
          reportRes = await axios.get(
            // `https://cs-qhmx.onrender.com/v1/file/report/${scanId}`
            `http://localhost:5005/v1/file/report/${scanId}`
          );

          if (reportRes.data.data.status === "completed") {
            setReport(reportRes.data.data);
            toast.success("File scanned successfully!", { id: toastId });
            return;
          }

          if (reportRes.data.data.status === "in-progress") {
            toast.loading(
              `Scan in progress... (Attempt ${attempts + 1}/${maxAttempts})`,
              { id: toastId }
            );
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            attempts++;
            continue;
          }

          if (reportRes.data.data.status === "failed") {
            throw new Error("Scan failed on server side");
          }
        } catch (err) {
          console.error(`Attempt ${attempts + 1} failed:`, err);
          if (err.response && err.response.status === 404) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            attempts++;
            continue;
          }
          throw err;
        }
      }

      throw new Error(
        `Scan timed out after ${(maxAttempts * pollInterval) / 1000} seconds`
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "File scan failed!", { id: toastId });
    } finally {
      setLoading(false);
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("File Threat Report", 20, 20);

    if (report?.file_info) {
      autoTable(doc, {
        startY: 30,
        head: [["File Information", "Value"]],
        body: [
          ["SHA256", report.file_info.sha256],
          ["MD5", report.file_info.md5],
          ["SHA1", report.file_info.sha1],
          ["Size", `${(report.file_info.size / 1024).toFixed(2)} KB`],
          ["Scan Date", new Date(report.date).toLocaleString()],
        ],
        styles: {
          fillColor: [255, 255, 255],
          textColor: [40, 40, 40],
        },
      });
    }

    if (report?.stats) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Threat Category", "Count"]],
        body: Object.entries(report.stats).map(([key, value]) => [key, value]),
        styles: {
          fillColor: [255, 255, 255],
        },
      });
    }

    if (report?.results && showDetails) {
      doc.addPage();
      doc.setFontSize(18);
      doc.text("Detailed Scan Results", 20, 20);

      const resultsData = Object.entries(report.results).map(
        ([engine, data]) => [
          engine,
          data.engine_version || "N/A",
          data.category,
          data.result || "N/A",
        ]
      );

      autoTable(doc, {
        startY: 30,
        head: [["Engine", "Version", "Category", "Result"]],
        body: resultsData,
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: "auto" },
        },
        margin: { horizontal: 10 },
        styles: {
          fontSize: 8,
          fillColor: [255, 255, 255],
        },
      });
    }

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

    doc.save(`file-scan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF report downloaded!");
  };

  const chartData = report?.stats
    ? {
        labels: Object.keys(report.stats),
        datasets: [
          {
            label: "Scan Results",
            data: Object.values(report.stats),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
              "rgba(201, 203, 207, 0.7)",
              "rgba(100, 100, 100, 0.7)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(201, 203, 207, 1)",
              "rgba(100, 100, 100, 1)",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Threat Detection Summary",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
      x: {
        title: {
          display: true,
          text: "Threat Category",
        },
      },
    },
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
            File Threat Scanner
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload files to scan for malware, viruses, and other security threats
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="max-w-3xl mx-auto"
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                file
                  ? "border-green-500 bg-green-900/10"
                  : "border-cyan-500 bg-[#1E293B]/50 hover:bg-[#1e324b]/50"
              } cursor-pointer`}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-4 bg-cyan-900/30 rounded-full"
                >
                  <svg
                    className="w-12 h-12 text-cyan-400"
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
                <p className="text-gray-300">
                  {file ? file.name : "Drag and drop your file here"}
                </p>
                <p className="text-gray-400 text-sm">
                  Supported formats: PDF, DOCX, CSV
                </p>
                <label className="inline-block">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-all"
                  >
                    {file ? "Change File" : "Browse Files"}
                  </motion.div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
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
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      ></path>
                    </svg>
                    Scan File
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Report Section */}
        <AnimatePresence>
          {report && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                {/* Report Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <motion.h2
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400"
                    >
                      Scan Report
                    </motion.h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Scanned on {new Date(report.date).toLocaleString()}
                    </p>
                  </div>
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3 mt-4 md:mt-0"
                  >
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
                  </motion.div>
                </div>

                {/* File Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 bg-gray-700/30 p-6 rounded-xl border border-gray-600"
                >
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    File Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">SHA256</p>
                      <p className="text-gray-200 truncate">
                        {report.file_info.sha256}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">MD5</p>
                      <p className="text-gray-200">{report.file_info.md5}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">SHA1</p>
                      <p className="text-gray-200">{report.file_info.sha1}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Size</p>
                      <p className="text-gray-200">
                        {(report.file_info.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Chart */}
                {chartData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 bg-gray-700/30 p-6 rounded-xl border border-gray-600"
                  >
                    <Bar data={chartData} options={chartOptions} />
                  </motion.div>
                )}

                {/* Stats Cards */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                >
                  {Object.entries(report.stats).map(([key, value]) => (
                    <motion.div
                      key={key}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className={`p-4 rounded-lg ${
                        value > 0
                          ? key === "malicious"
                            ? "bg-red-900/50 border border-red-500/50"
                            : key === "suspicious"
                            ? "bg-orange-900/50 border border-orange-500/50"
                            : "bg-blue-900/50 border border-blue-500/50"
                          : "bg-green-900/30 border border-green-500/30"
                      } shadow-md`}
                    >
                      <p className="text-sm font-medium text-gray-300 capitalize">
                        {key.replace("-", " ")}
                      </p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          value > 0
                            ? key === "malicious"
                              ? "text-red-400"
                              : key === "suspicious"
                              ? "text-orange-400"
                              : "text-blue-400"
                            : "text-green-400"
                        }`}
                      >
                        {value}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Detailed Results */}
                <AnimatePresence>
                  {showDetails && report.results && (
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
                                  Version
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                                  Result
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                              {Object.entries(report.results).map(
                                ([engine, data]) => (
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
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                      {data.engine_version || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          data.category === "malicious"
                                            ? "bg-red-900 text-red-200"
                                            : data.category === "suspicious"
                                            ? "bg-yellow-900 text-yellow-200"
                                            : data.category === "undetected"
                                            ? "bg-blue-900 text-blue-200"
                                            : data.category === "harmless"
                                            ? "bg-green-900 text-green-200"
                                            : "bg-gray-800 text-gray-300"
                                        }`}
                                      >
                                        {data.category}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {data.result || "N/A"}
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

                {/* AI Analysis */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <AIRiskAnalysis
                    scanType="File Scan"
                    stats={{
                      malicious: report.stats.malicious || 0,
                      suspicious: report.stats.suspicious || 0,
                      harmless: report.stats.harmless || 0,
                      undetected: report.stats.undetected || 0,
                      timeout: report.stats.timeout || 0,
                    }}
                    results={report.results}
                    meta={{
                      target: file,
                      timestamp: new Date().toISOString(),
                      creationDate: report.creation_date,
                      lastUpdate: report.last_update_date,
                      reputation: report.reputation,
                      tld: report.tld,
                    }}
                  />
                </motion.div>

                {/* VirusTotal Link */}
                {report.virustotal_link && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-center"
                  >
                    <a
                      href={report.virustotal_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View on VirusTotal
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FileUploadScan;