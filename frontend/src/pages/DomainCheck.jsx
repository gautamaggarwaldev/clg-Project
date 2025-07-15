import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import toast from "react-hot-toast";
import { toast } from 'react-toastify';

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

const DomainCheck = () => {
  const [domain, setDomain] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleScan = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5005/v1/domain/report/${domain}`
      );
      console.log(data);
      if (data.success) {
        // Updated to match the API response structure
        const stats =
          data.data.data.attributes.last_analysis_stats ||
          calculateStats(data.data.data.attributes.last_analysis_results);
        setReport({
          ...data.data.data.attributes,
          stats,
          results: data.data.data.attributes.last_analysis_results,
        });
        toast.success("Domain scanned successfully!");
      } else {
        toast.error("Failed to fetch domain report.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while scanning.");
    } finally {
      setLoading(false);
    }
  };

  //   const generatePDF = () => {
  //     if (!report) return;

  //     const doc = new jsPDF();

  //     doc.setFontSize(22);
  //     doc.setTextColor(30, 30, 30);
  //     doc.text(`Domain Report: ${domain}`, 20, 20);

  //     autoTable(doc, {
  //       startY: 30,
  //       head: [['Category', 'Count']],
  //       body: Object.entries(report.stats).map(([key, val]) => [key, val]),
  //       styles: { textColor: [50, 50, 50] },
  //       headStyles: { fillColor: [0, 204, 204] },
  //     });

  //     autoTable(doc, {
  //       startY: doc.lastAutoTable.finalY + 10,
  //       head: [['Engine', 'Category', 'Result']],
  //       body: Object.entries(report.results || {}).map(([engine, info]) => [
  //         engine,
  //         info?.category || 'undetected',
  //         info?.result || 'unknown',
  //       ]),
  //       styles: { fontSize: 9 },
  //       headStyles: { fillColor: [100, 100, 255] },
  //     });

  //     // Footer + Watermark
  //     const totalPages = doc.internal.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);

  //       // Watermark
  //       doc.setFontSize(50);
  //       doc.setTextColor(240, 240, 240);
  //       doc.text('GG\'s Security Check', 35, 180, { angle: 45 });

  //       // Footer text
  //       doc.setFontSize(10);
  //       doc.setTextColor(80, 80, 80);
  //       doc.text(
  //         "GG's Security | email: ggkisuraksha@email.com | phone: +91 78899555",
  //         20,
  //         doc.internal.pageSize.height - 10
  //       );
  //     }

  //     doc.save(`domain-report-${domain}.pdf`);
  //     toast.success('PDF downloaded successfully!');
  //   };
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

      // Improved Watermark - less intrusive
      doc.setFontSize(40);
      doc.setTextColor(200); // Lighter gray that won't obscure content
      doc.setGState(new doc.GState({ opacity: 0.4 })); // Make it more transparent
      doc.text(
        "GG's Security",
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height / 2,
        { angle: 45, align: "center" }
      );
      doc.setGState(new doc.GState({ opacity: 1 })); // Reset opacity

      // Footer text
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
    <div className="p-6 bg-[#0B1120] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Domain Check</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., example.com)"
          className="p-2 rounded bg-[#1E293B] border border-cyan-500 w-full md:w-1/2"
        />
        <button
          onClick={handleScan}
          className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700 transition"
        >
          {loading ? "Scanning..." : "Scan Domain"}
        </button>
      </div>

      {report && (
        <div className="bg-[#1E293B] p-6 rounded-xl border border-cyan-700 shadow-lg">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
            Scan Summary
          </h2>

          {/* Risk Bar */}
          <div className="mb-4">
            <p className="mb-1 text-sm">Risk Level:</p>
            <div className="w-full bg-gray-700 rounded h-6">
              <div
                className={`h-6 rounded ${
                  calculateRisk(report.stats) > 50
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${calculateRisk(report.stats)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">
              {calculateRisk(report.stats)}% Risk Detected
            </p>
          </div>

          {/* Stats Table */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-300 mb-4">
            {Object.entries(report.stats).map(([key, value]) => (
              <div key={key}>
                <span className="text-cyan-400 capitalize">{key}:</span> {value}
              </div>
            ))}
          </div>

          {/* Additional Domain Info */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
              Domain Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-cyan-400">Creation Date:</span>{" "}
                {new Date(report.creation_date * 1000).toLocaleString()}
              </div>
              <div>
                <span className="text-cyan-400">Last Update:</span>{" "}
                {new Date(report.last_update_date * 1000).toLocaleString()}
              </div>
              <div>
                <span className="text-cyan-400">Reputation:</span>{" "}
                {report.reputation}
              </div>
              <div>
                <span className="text-cyan-400">TLD:</span> {report.tld}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap mt-4">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              {showDetail ? "Hide Detailed Report" : "View Detailed Report"}
            </button>

            <button
              onClick={generatePDF}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Download PDF Report
            </button>
          </div>

          {/* Full Detail Report */}
          {showDetail && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                Detailed Engine Analysis
              </h3>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="min-w-full text-sm text-gray-300 border border-cyan-500 rounded">
                  <thead className="bg-cyan-800 text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Engine</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.results || {}).map(
                      ([engine, info]) => (
                        <tr key={engine} className="border-b border-cyan-700">
                          <td className="px-3 py-2">{engine}</td>
                          <td className="px-3 py-2 capitalize">
                            {info?.category || "undetected"}
                          </td>
                          <td className="px-3 py-2">
                            {info?.result || "unknown"}
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

export default DomainCheck;
