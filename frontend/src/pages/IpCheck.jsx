import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

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

    // Basic IP validation
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      toast.error("Please enter a valid IP address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5005/v1/ip/report/${ip}`
      );
      console.log("API Response:", data); // Debug log

      if (data.success) {
        // Check if the data structure matches what we expect
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

    // Basic Info Table
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

    // Stats Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Category", "Count"]],
      body: Object.entries(report.stats).map(([key, val]) => [key, val]),
      styles: { textColor: [50, 50, 50] },
      headStyles: { fillColor: [100, 100, 255] },
    });

    // Detailed Results
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

    // Footer + Watermark
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
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

    doc.save(`ip-report-${ip}.pdf`);
    toast.success("PDF downloaded successfully!");
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      // Convert seconds to milliseconds if needed
      const date = new Date(timestamp * 1000);
      return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="p-6 bg-[#0B1120] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">
        IP Address Check
      </h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          className="p-2 rounded bg-[#1E293B] border border-cyan-500 w-full md:w-1/2"
        />
        <button
          onClick={handleScan}
          className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700 transition"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan IP"}
        </button>
      </div>

      {report && (
        <div className="bg-[#1E293B] p-6 rounded-xl border border-cyan-700 shadow-lg">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
            Scan Summary
          </h2>

          {/* Risk Bar */}
          {/* Risk Bar */}
          <div className="mb-4">
            <p className="mb-1 text-sm">Threat Analysis:</p>
            <div className="w-full bg-gray-700 rounded h-6 flex overflow-hidden">
              {report.stats.malicious > 0 && (
                <div
                  className="h-6 bg-red-600"
                  style={{
                    width: `${
                      (report.stats.malicious /
                        Object.values(report.stats).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100
                    }%`,
                  }}
                  title={`Malicious: ${report.stats.malicious}`}
                ></div>
              )}
              {report.stats.suspicious > 0 && (
                <div
                  className="h-6 bg-orange-500"
                  style={{
                    width: `${
                      (report.stats.suspicious /
                        Object.values(report.stats).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100
                    }%`,
                  }}
                  title={`Suspicious: ${report.stats.suspicious}`}
                ></div>
              )}
              {report.stats.harmless > 0 && (
                <div
                  className="h-6 bg-green-500"
                  style={{
                    width: `${
                      (report.stats.harmless /
                        Object.values(report.stats).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100
                    }%`,
                  }}
                  title={`Harmless: ${report.stats.harmless}`}
                ></div>
              )}
              {report.stats.undetected > 0 && (
                <div
                  className="h-6 bg-gray-500"
                  style={{
                    width: `${
                      (report.stats.undetected /
                        Object.values(report.stats).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100
                    }%`,
                  }}
                  title={`Undetected: ${report.stats.undetected}`}
                ></div>
              )}
              {report.stats.timeout > 0 && (
                <div
                  className="h-6 bg-yellow-500"
                  style={{
                    width: `${
                      (report.stats.timeout /
                        Object.values(report.stats).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100
                    }%`,
                  }}
                  title={`Timeout: ${report.stats.timeout}`}
                ></div>
              )}
            </div>
            <div className="flex justify-between text-xs mt-1">
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
            <p className="text-sm mt-1">
              Risk Level: {calculateRisk(report.stats)}% (Malicious +
              Suspicious)
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

          {/* IP Information */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
              IP Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-cyan-400">IP Address:</span> {ip}
              </div>
              <div>
                <span className="text-cyan-400">Country:</span>{" "}
                {report.ipInfo.country || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">ASN:</span>{" "}
                {report.ipInfo.asn || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">Network:</span>{" "}
                {report.ipInfo.network || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">Registry:</span>{" "}
                {report.ipInfo.registry || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">AS Owner:</span>{" "}
                {report.ipInfo.asOwner || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">Reputation:</span>{" "}
                {report.reputation || "Unknown"}
              </div>
              <div>
                <span className="text-cyan-400">Last Analysis:</span>{" "}
                {formatDate(report.last_analysis_date)}
              </div>
              {report.whois_date && (
                <div>
                  <span className="text-cyan-400">Whois Date:</span>{" "}
                  {formatDate(report.whois_date)}
                </div>
              )}
              {report.last_modification_date && (
                <div>
                  <span className="text-cyan-400">Last Modified:</span>{" "}
                  {formatDate(report.last_modification_date)}
                </div>
              )}
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

export default IpCheck;
