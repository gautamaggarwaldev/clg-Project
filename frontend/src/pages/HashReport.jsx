import React, { useState, useCallback } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

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
      setHashInput(sha256); // Auto-fill the hash input with SHA-256
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
        // File was submitted for analysis
        toast.success("File submitted for analysis. Please check back later.");
        setReport({
          status: "queued",
          analysis_id: data.data.analysis_id,
        });
      } else {
        // Report exists
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
    if (riskPercentage === 0) return "bg-green-500";
    if (riskPercentage <= 30) return "bg-yellow-500";
    if (riskPercentage <= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskLevel = (riskPercentage) => {
    if (riskPercentage === 0) return "No risk";
    if (riskPercentage <= 30) return "Low risk";
    if (riskPercentage <= 70) return "Medium risk";
    return "High risk";
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("File Hash Scan Report", 20, 20);

    // File Info
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

    // Scan Results Summary
    doc.setFontSize(14);
    doc.text("Scan Results Summary:", 20, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Category", "Count"]],
      body: Object.entries(report.status || {}).map(([key, val]) => [key, val]),
    });

    // Risk Assessment
    const riskPercentage = calculateRisk(report.status);
    doc.setFontSize(14);
    doc.text(
      `Risk Assessment: ${riskPercentage}% (${getRiskLevel(riskPercentage)})`,
      20,
      doc.lastAutoTable.finalY + 15
    );

    // Detailed Results
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

    // Watermark and footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Watermark
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

      // Footer
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
      <div className="w-full h-6 bg-gray-200 rounded overflow-hidden flex">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`${cat.color} h-6`}
            style={{
              width: `${(report.status[cat.name] / total) * 100}%`,
            }}
            title={`${cat.name}: ${report.status[cat.name]}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#0B1120] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">
        File Hash Scanner & Report
      </h1>

      {/* File Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">
          Upload File to Generate Hash
        </h2>

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-4 ${
            isDragActive ? "border-cyan-500 bg-[#1E293B]" : "border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-cyan-400">Drop the file here...</p>
          ) : (
            <div>
              <p className="mb-2">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-400">
                Supported formats: PDF, DOCX, CSV
              </p>
            </div>
          )}
        </div>

        {/* Or traditional file input */}
        <div className="text-center mb-4">
          <span className="text-gray-400">or</span>
        </div>

        <div className="flex justify-center">
          <label className="bg-[#1E293B] hover:bg-[#334155] px-4 py-2 rounded cursor-pointer">
            Select File
            <input
              type="file"
              accept=".pdf,.docx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Hash Display */}
        {hashes.md5 && (
          <div className="mt-6 bg-[#1E293B] p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-300 mb-2">File Hashes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-bold text-gray-300">MD5:</span>
                <p className="break-all">{hashes.md5}</p>
              </div>
              <div>
                <span className="font-bold text-gray-300">SHA-1:</span>
                <p className="break-all">{hashes.sha1}</p>
              </div>
              <div>
                <span className="font-bold text-gray-300">SHA-256:</span>
                <p className="break-all">{hashes.sha256}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hash Input Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">
          Scan File by Hash
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="Enter SHA-256, MD5, or SHA-1 hash..."
            className="flex-grow p-3 rounded bg-[#1E293B] border border-cyan-500 focus:border-cyan-300 focus:outline-none"
          />
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
              "Scan Hash"
            )}
          </button>
        </div>
      </div>

      {/* Scan Results */}
      {report && (
        <div className="bg-[#1E293B] p-6 rounded-xl border border-cyan-700 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl text-cyan-300">Scan Results</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Risk Level */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Risk Assessment</span>
              <span className="font-semibold">
                {calculateRisk(report.status)}% -{" "}
                {getRiskLevel(calculateRisk(report.status))}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getRiskColor(
                  calculateRisk(report.status)
                )}`}
                style={{ width: `${calculateRisk(report.status)}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Visualization */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Detection Breakdown</h3>
            {renderStatsBar()}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span>Malicious: {report.status.malicious || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Suspicious: {report.status.suspicious || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Harmless: {report.status.harmless || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span>Undetected: {report.status.undetected || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span>Timeout: {report.status.timeout || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Failure: {report.status.failure || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span>
                  Unsupported: {report.status["type-unsupported"] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="mb-6 bg-[#0F172A] p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-300 mb-2">
              File Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">SHA-256</p>
                <p className="break-all">{report.file_info.sha256}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">MD5</p>
                <p className="break-all">{report.file_info.md5}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">SHA-1</p>
                <p className="break-all">{report.file_info.sha1}</p>
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
          {showDetails && (
            <div className="mt-6">
              <h3 className="font-semibold text-cyan-300 mb-3">
                Detailed Scan Results
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-[#0F172A] rounded-lg overflow-hidden">
                  <thead className="bg-[#1E293B]">
                    <tr>
                      <th className="px-4 py-2 text-left">Engine</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Result</th>
                      <th className="px-4 py-2 text-left">Version</th>
                      <th className="px-4 py-2 text-left">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {Object.entries(report.results || {}).map(
                      ([engine, info]) => (
                        <tr key={engine} className="hover:bg-[#1E293B]">
                          <td className="px-4 py-2">{engine}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                info.category === "malicious"
                                  ? "bg-red-100 text-red-800"
                                  : info.category === "suspicious"
                                  ? "bg-orange-100 text-orange-800"
                                  : info.category === "harmless"
                                  ? "bg-green-100 text-green-800"
                                  : info.category === "undetected"
                                  ? "bg-gray-100 text-gray-800"
                                  : info.category === "timeout"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : info.category === "failure"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {info.category}
                            </span>
                          </td>
                          <td className="px-4 py-2">{info.result || "N/A"}</td>
                          <td className="px-4 py-2">
                            {info.engine_version || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            {info.engine_update || "N/A"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default HashReport;
