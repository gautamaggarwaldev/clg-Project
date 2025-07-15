import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

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
    setReport(null); // Reset previous report

    let toastId; // Declare toastId here so it's accessible in catch block

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const uploadRes = await axios.post(
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

      // Show toast notification that scan is in progress
      toastId = toast.loading("Scanning file... This may take a moment");

      // Poll for report using scanId
      let reportRes;
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 3000; // 3 seconds

      while (attempts < maxAttempts) {
        try {
          reportRes = await axios.get(
            `http://localhost:5005/v1/file/report/${scanId}`
          );

          // Check if scan is completed
          if (reportRes.data.data.status === "completed") {
            setReport(reportRes.data.data);
            toast.success("File scanned successfully!", { id: toastId });
            return;
          }

          // If scan is still in progress
          if (reportRes.data.data.status === "in-progress") {
            toast.loading(
              `Scan in progress... (Attempt ${attempts + 1}/${maxAttempts})`,
              { id: toastId }
            );
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            attempts++;
            continue;
          }

          // If scan failed on server side
          if (reportRes.data.data.status === "failed") {
            throw new Error("Scan failed on server side");
          }
        } catch (err) {
          console.error(`Attempt ${attempts + 1} failed:`, err);
          // If it's not a network error, maybe the scan is still processing
          if (err.response && err.response.status === 404) {
            // Scan result not ready yet
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            attempts++;
            continue;
          }
          throw err; // Re-throw other errors
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
      // Ensure the loading toast is dismissed if it's still showing
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Set default font
    doc.setFont("helvetica", "normal");

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40); // Dark gray for content
    doc.text("File Threat Report", 20, 20);

    // File Info
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
          fillColor: [255, 255, 255], // White background for tables
          textColor: [40, 40, 40], // Dark text
        },
      });
    }

    // Stats Table
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

    // Detailed Results
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

    // Watermark & Footer
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
              "rgba(255, 99, 132, 0.7)", // malicious
              "rgba(255, 206, 86, 0.7)", // suspicious
              "rgba(54, 162, 235, 0.7)", // undetected
              "rgba(75, 192, 192, 0.7)", // harmless
              "rgba(153, 102, 255, 0.7)", // timeout
              "rgba(255, 159, 64, 0.7)", // confirmed-timeout
              "rgba(201, 203, 207, 0.7)", // failure
              "rgba(100, 100, 100, 0.7)", // type-unsupported
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
    <div className="p-6 bg-[#0B1120] text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">
        File Threat Scanner
      </h2>

      {/* File Upload */}
      <div className="max-w-3xl mx-auto">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-cyan-500 p-8 rounded-lg text-center mb-6 bg-[#1E293B] hover:bg-[#1e324b] transition cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
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
            <p className="text-gray-300 mb-2">Drag and drop your file here</p>
            <p className="text-gray-400 text-sm mb-4">
              Supported formats: PDF, DOCX, CSV
            </p>
            <label className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded cursor-pointer transition">
              Browse Files
              <input
                type="file"
                accept=".pdf,.docx,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <div className="mt-4 p-3 bg-[#0f172a] rounded flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <span className="text-cyan-400">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full py-3 rounded-lg font-medium transition ${
            loading || !file
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
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
            "Scan File"
          )}
        </button>
      </div>

      {/* Report */}
      {report && (
        <div className="max-w-6xl mx-auto mt-8 bg-[#1E293B] p-6 rounded-xl border border-cyan-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-cyan-300">
                Scan Report
              </h3>
              <p className="text-gray-400 text-sm">
                Scanned on {new Date(report.date).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          {/* File Info */}
          <div className="mb-6 p-4 bg-[#0f172a] rounded-lg">
            <h4 className="text-lg font-medium text-cyan-200 mb-3">
              File Information
            </h4>
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
          </div>

          {/* Bar Chart */}
          {chartData && (
            <div className="mb-8 bg-[#0f172a] p-4 rounded-lg">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Object.entries(report.stats).map(([key, value]) => (
              <div
                key={key}
                className={`p-3 rounded-lg ${
                  value > 0 ? "bg-red-900/50" : "bg-green-900/30"
                }`}
              >
                <p className="text-sm font-medium text-gray-300 capitalize">
                  {key.replace("-", " ")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    value > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Report */}
          {showDetails && report.results && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-cyan-200 mb-3">
                Detailed Scan Results
              </h4>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#0f172a]">
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
                  <tbody className="bg-[#1E293B] divide-y divide-gray-700">
                    {Object.entries(report.results).map(([engine, data]) => (
                      <tr key={engine}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VirusTotal Link */}
          {report.virustotal_link && (
            <div className="mt-6 text-center">
              <a
                href={report.virustotal_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadScan;
