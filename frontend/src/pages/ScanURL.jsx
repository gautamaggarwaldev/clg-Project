import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import AIRiskAnalysis from "../components/AiRiskAnalysis";

const ScanURL = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState("");
  const [showFullReport, setShowFullReport] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScanData(null);
    setError("");
    setShowFullReport(false);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5005/v1/url/scan",
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setScanData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to scan URL. Make sure you're logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const watermark = (text) => {
      doc.setFontSize(40);
      doc.setTextColor(200);
      doc.text(text, 35, 150, { angle: 45 });
    };

    // Watermark on all pages
    const totalPagesExp = "{total_pages_count_string}";
    const pageContent = function (data) {
      doc.setFontSize(40);
      doc.setTextColor(200);
      doc.setFont("helvetica", "bold");

      if (doc.setGState) {
        const gState = doc.GState
          ? new doc.GState({ opacity: 0.4 })
          : { opacity: 0.1 };
        doc.setGState(gState);
      }

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const text = "GG's Security Check";
      const textWidth =
        (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;

      doc.text(text, pageWidth / 2 - textWidth / 2, pageHeight / 2, {
        angle: 45,
      });

      if (doc.setGState) {
        doc.setGState(new doc.GState({ opacity: 1 }));
      }

      doc.setFontSize(10);
      doc.setTextColor(80); // Darker text
      doc.setFont("helvetica", "normal");

      doc.text(
        "GG's Security | email: ggkisuraksha@email.com | phone: +91 78899555",
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    };

    doc.setFontSize(20);
    doc.setTextColor("#2563eb");
    doc.text("URL Scan Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor("#000");
    doc.text(`Scanned URL: ${scanData.url}`, 20, 35);
    doc.text(`Status: ${scanData.scanResult.attributes.status}`, 20, 45);

    const stats = scanData.scanResult.attributes.stats;
    doc.setTextColor("#ef4444");
    doc.text(`Malicious: ${stats.malicious}`, 20, 60);
    doc.setTextColor("#f59e0b");
    doc.text(`Suspicious: ${stats.suspicious}`, 20, 70);
    doc.setTextColor("#22c55e");
    doc.text(`Harmless: ${stats.harmless}`, 20, 80);
    doc.setTextColor("#a3a3a3");
    doc.text(`Undetected: ${stats.undetected}`, 20, 90);

    // Engine-wise full scan table
    const rows = Object.entries(scanData.scanResult.attributes.results).map(
      ([engine, result]) => [
        engine,
        result.result || "clean",
        result.category || "unknown",
      ]
    );

    doc.setTextColor("#000");
    doc.text("Detailed Results by Engine:", 20, 105);

    autoTable(doc, {
      startY: 110,
      head: [["Engine", "Result", "Category"]],
      body: rows,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      didDrawPage: pageContent,
    });

    doc.save("url-scan-report.pdf");
    toast.success("PDF report downloaded successfully!");
  };

  const renderBar = (label, count, total, color) => {
    const percent = (count / total) * 100;
    return (
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{count}</span>
        </div>
        <div className="w-full bg-gray-800 rounded h-3">
          <div
            className="h-3 rounded"
            style={{ width: `${percent}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Scan a URL</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <input
          type="url"
          required
          placeholder="Enter a URL to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-3 rounded bg-[#1E293B] text-white outline-none border border-cyan-700 focus:border-cyan-400"
        />
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan URL"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {scanData && (
        <div className="mt-8 bg-[#1E293B] p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-cyan-300">
            Scan Summary
          </h3>
          <p className="mb-4">
            URL: <span className="text-cyan-400">{scanData.url}</span>
          </p>

          {/* Threat Stats */}
          <div className="space-y-2">
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
              "#eab308"
            )}
            {renderBar(
              "Harmless",
              scanData.scanResult.attributes.stats.harmless,
              100,
              "#22c55e"
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowFullReport(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              View Full Report
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Download PDF
            </button>
          </div>

          {/* AI Risk Analysis Component */}
          <AIRiskAnalysis
            scanType="URL Scan"
            stats={scanData.scanResult.attributes.stats}
            results={scanData.scanResult.attributes.results}
            meta={{
              url: scanData.url,
              scanDate: new Date().toISOString(),
            }}
          />
        </div>
      )}

      {/* Full Report Modal */}
      {showFullReport && scanData && (
        <div className="mt-8 bg-[#111827] p-6 rounded-xl border border-cyan-700 shadow-inner">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">
            Detailed Report
          </h3>
          <div className="max-h-[400px] overflow-y-auto space-y-4 text-sm">
            {Object.entries(scanData.scanResult.attributes.results).map(
              ([engine, result], index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-gray-700 pb-2"
                >
                  <div className="font-medium">{engine}</div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        result.category === "malicious"
                          ? "bg-red-700"
                          : result.category === "suspicious"
                          ? "bg-yellow-700"
                          : result.category === "harmless"
                          ? "bg-green-700"
                          : "bg-gray-600"
                      }`}
                    >
                      {result.result}
                    </span>
                    <div className="text-gray-400 text-xs">
                      ({result.category})
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <button
            className="mt-4 text-sm text-cyan-400 underline"
            onClick={() => setShowFullReport(false)}
          >
            Close Full Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanURL;