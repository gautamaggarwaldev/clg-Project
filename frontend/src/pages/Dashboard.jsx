import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  CartesianGrid,
  LabelList,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import {
  FiMail,
  FiDownload,
  FiClock,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { FaShieldAlt, FaGlobe, FaLink } from "react-icons/fa";

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [urlScans, setUrlScans] = useState([]);
  const [ipScans, setIpScans] = useState([]);
  const [domainScans, setDomainScans] = useState([]);
  const [timeInfo, setTimeInfo] = useState({ time: "", date: "", weekday: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color schemes
  const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B"];
  const SAFETY_COLORS = {
    safe: "#10B981",
    moderate: "#F59E0B",
    dangerous: "#EF4444",
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([getUserData(), getAllScanData()]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    getTimeData();
    const timer = setInterval(getTimeData, 1000);
    return () => clearInterval(timer);
  }, []);

  const getUserData = async () => {
    try {
      const res = await axios.get("http://localhost:5005/v1/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data?.user || {});
    } catch (err) {
      console.error("User fetch error:", err);
      setError("Failed to load user profile.");
    }
  };

  const getAllScanData = async () => {
    try {
      const [urlRes, ipRes, domainRes] = await Promise.all([
        axios.get("http://localhost:5005/v1/url/scan-my-all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get("http://localhost:5005/v1/ip/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get("http://localhost:5005/v1/domain/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      // Process URL scans - ensure we have maliciousScore
      const processedUrlScans = (urlRes.data?.scans || [])
        .map((scan) => ({
          ...scan,
          url: scan.url || "Unknown URL",
          maliciousScore: scan.maliciousScore || 0,
        }))
        .slice(0, 10);

      // Process IP scans - ensure we have reputation
      const processedIpScans = (ipRes.data?.data || [])
        .map((scan) => ({
          ...scan,
          ip: scan.ip || "Unknown IP",
          reputation: scan.reputation || 0,
        }))
        .slice(0, 10);

      // Process Domain scans - ensure we have score
      const processedDomainScans = (domainRes.data?.data || [])
        .map((scan) => ({
          ...scan,
          domain: scan.domain || "Unknown Domain",
          score: scan.score || 0,
        }))
        .slice(0, 10);

      setUrlScans(processedUrlScans);
      setIpScans(processedIpScans);
      setDomainScans(processedDomainScans);
    } catch (err) {
      console.error("Scan data fetch error:", err);
      setError("Failed to load scan history.");
      setUrlScans([]);
      setIpScans([]);
      setDomainScans([]);
    }
  };

  const validateAndProcessData = (data, propertyName) => {
    if (!data || !data[propertyName]) {
      return [];
    }

    const dataArray = Array.isArray(data[propertyName])
      ? data[propertyName]
      : [];
    return dataArray.slice(0, 10);
  };

  const getTimeData = () => {
    const now = new Date();
    setTimeInfo({
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      weekday: now.toLocaleDateString(undefined, { weekday: "long" }),
    });
  };

  // const generatePdf = async () => {
  //   try {
  //     const dashboardElement = document.getElementById("dashboard-section");
  //     const canvas = await html2canvas(dashboardElement, {
  //       scale: 2,
  //       logging: false,
  //       useCORS: true,
  //     });
  //     const imgData = canvas.toDataURL("image/png");

  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const width = pdf.internal.pageSize.getWidth();
  //     const height = (canvas.height * width) / canvas.width;

  //     pdf.addImage(imgData, "PNG", 0, 0, width, height);
  //     pdf.save(
  //       `${user.name || "user"}-security-report-${new Date()
  //         .toISOString()
  //         .slice(0, 10)}.pdf`
  //     );
  //   } catch (err) {
  //     console.error("PDF generation error:", err);
  //     setError("Failed to generate PDF. Please try again.");
  //   }
  // };

  const generatePdf = async () => {
    try {
      // Show loading state
      const button = document.querySelector("[data-pdf-button]");
      if (button) {
        button.disabled = true;
        button.innerHTML =
          '<svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">' +
          '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>' +
          '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
          "</svg>Generating...";
      }

      // Capture dashboard as image
      const dashboardElement = document.getElementById("dashboard-section");
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: dashboardElement.scrollWidth,
        windowHeight: dashboardElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      // Set document properties
      pdf.setProperties({
        title: `${user.name || "User"} Security Report`,
        subject: "Security Dashboard Export",
        author: "Security Dashboard",
        creator: "Security Dashboard",
        keywords: "security, report, dashboard",
      });

      // Calculate image dimensions to fit PDF page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 20; // margin of 10mm on each side
      const imgHeight = imgWidth * ratio;

      // Add cover page with metadata
      pdf.setFontSize(22);
      pdf.setTextColor(40, 40, 40);
      pdf.text("SECURITY DASHBOARD REPORT", pageWidth / 2, 30, {
        align: "center",
      });

      pdf.setFontSize(16);
      pdf.text(`Generated for: ${user.name || "User"}`, pageWidth / 2, 45, {
        align: "center",
      });

      pdf.setFontSize(14);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, {
        align: "center",
      });
      pdf.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth / 2, 65, {
        align: "center",
      });

      // Add dashboard image on a new page
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        10,
        10,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      // Add summary page with key metrics
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.text("SUMMARY METRICS", 15, 20);

      pdf.setFontSize(12);
      pdf.text(`• Total Scanned URLs: ${urlScans.length}`, 20, 35);
      pdf.text(`• Total Scanned IPs: ${ipScans.length}`, 20, 45);
      pdf.text(`• Total Scanned Domains: ${domainScans.length}`, 20, 55);

      // Add security status indicators
      const safeCount = urlScans.filter(
        (scan) => scan.maliciousScore < 30
      ).length;
      const warningCount = urlScans.filter(
        (scan) => scan.maliciousScore >= 30 && scan.maliciousScore < 70
      ).length;
      const dangerCount = urlScans.filter(
        (scan) => scan.maliciousScore >= 70
      ).length;

      pdf.setFontSize(14);
      pdf.text("URL Safety Distribution:", 15, 75);
      pdf.setFontSize(12);
      pdf.setTextColor(0, 128, 0); // Green
      pdf.text(
        `✓ Safe: ${safeCount} (${Math.round(
          (safeCount / urlScans.length) * 100
        )}%)`,
        25,
        85
      );
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text(
        `⚠ Warning: ${warningCount} (${Math.round(
          (warningCount / urlScans.length) * 100
        )}%)`,
        25,
        95
      );
      pdf.setTextColor(255, 0, 0); // Red
      pdf.text(
        `✗ Dangerous: ${dangerCount} (${Math.round(
          (dangerCount / urlScans.length) * 100
        )}%)`,
        25,
        105
      );

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
          align: "right",
        });
        pdf.text(`Generated by Security Dashboard`, 10, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(
        `${user.name || "user"}-security-report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");

      // Fallback to simple PDF if image capture fails
      try {
        const pdf = new jsPDF();
        pdf.text("Security Dashboard Report", 20, 20);
        pdf.text(`Generated for: ${user.name || "User"}`, 20, 30);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        pdf.text("Could not capture dashboard image.", 20, 50);
        pdf.text("Here are your scan counts:", 20, 60);
        pdf.text(`URLs: ${urlScans.length}`, 30, 70);
        pdf.text(`IPs: ${ipScans.length}`, 30, 80);
        pdf.text(`Domains: ${domainScans.length}`, 30, 90);
        pdf.save(
          `fallback-report-${new Date().toISOString().slice(0, 10)}.pdf`
        );
      } catch (fallbackErr) {
        console.error("Fallback PDF failed:", fallbackErr);
      }
    } finally {
      // Reset button state
      const button = document.querySelector("[data-pdf-button]");
      if (button) {
        button.disabled = false;
        button.innerHTML =
          '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' +
          "</svg>Export as PDF";
      }
    }
  };
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getSafetyStatus = (score) => {
    if (!score && score !== 0) return "unknown";
    const numScore = Number(score);
    if (numScore < 30) return "safe";
    if (numScore < 70) return "moderate";
    return "dangerous";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md"
        >
          <strong>Error:</strong> {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Calculate stats for the overview cards
  const stats = [
    {
      title: "Scanned URLs",
      value: urlScans.length,
      icon: <FaLink className="text-indigo-600 text-xl" />,
      color: "indigo",
    },
    {
      title: "Scanned IPs",
      value: ipScans.length,
      icon: <FaShieldAlt className="text-purple-600 text-xl" />,
      color: "purple",
    },
    {
      title: "Scanned Domains",
      value: domainScans.length,
      icon: <FaGlobe className="text-pink-600 text-xl" />,
      color: "pink",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen"
      id="dashboard-section"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {greeting()},{" "}
            <span className="text-indigo-600">{user.name || "User"}</span> 👋
          </h1>
          <div className="flex items-center mt-2 text-gray-600">
            <FiUser className="mr-2" />
            <span>{user.email || "No email available"}</span>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-end bg-white p-4 rounded-lg shadow-sm mt-4 md:mt-0"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center text-gray-600 mb-1">
            <FiCalendar className="mr-2" />
            <span className="font-medium">
              {timeInfo.weekday}, {timeInfo.date}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiClock className="mr-2" />
            <span className="font-medium">{timeInfo.time}</span>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-8">
        <motion.a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=gghelp@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-white hover:bg-gray-100 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMail className="mr-2" />
          Contact Support
        </motion.a>
        <motion.button
          onClick={generatePdf}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiDownload className="mr-2" />
          Export as PDF
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${stat.color}-400 hover:shadow-md transition-shadow duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Only show if we have data */}
      {urlScans.length > 0 || ipScans.length > 0 || domainScans.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* URL Scan Chart */}
            {urlScans.length > 0 && (
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaLink className="mr-2 text-indigo-500" />
                    URL Safety Analysis
                  </h2>
                  <span className="text-sm text-gray-500">
                    Last {urlScans.length} scans
                  </span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={urlScans.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorUrl"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366F1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366F1"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis
                        dataKey="url"
                        type="category"
                        width={150}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => {
                          // Safely handle the URL formatting
                          if (typeof value !== "string") {
                            return ""; // Return empty string if not a string
                          }
                          try {
                            const urlObj = new URL(value);
                            const hostname = urlObj.hostname;
                            return hostname.length > 30
                              ? `${hostname.substring(0, 30)}...`
                              : hostname;
                          } catch {
                            // If URL parsing fails, try basic string cleaning
                            const cleanUrl = value.replace(/^https?:\/\//, "");
                            return cleanUrl.length > 30
                              ? `${cleanUrl.substring(0, 30)}...`
                              : cleanUrl;
                          }
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Malicious Score"]}
                        labelFormatter={(label) => `URL: ${label}`}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #eee",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="maliciousScore"
                        name="Malicious Score"
                        fill="url(#colorUrl)"
                        animationDuration={1500}
                        radius={[0, 4, 4, 0]}
                      >
                        <LabelList
                          dataKey="maliciousScore"
                          position="right"
                          formatter={(value) => `${value}%`}
                          style={{ fill: "#4b5563", fontSize: "10px" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {urlScans.length > 10 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Showing 10 most recent scans out of {urlScans.length}
                  </p>
                )}
              </motion.div>
            )}

            {/* IP Scan Chart */}
            {ipScans.length > 0 && (
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaShieldAlt className="mr-2 text-purple-500" />
                    IP Reputation
                  </h2>
                  <span className="text-sm text-gray-500">
                    Last {ipScans.length} scans
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ipScans}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorIp"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="ip"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          padding: "12px",
                        }}
                        formatter={(value) => [
                          `Score: ${value}`,
                          "Reputation Score",
                        ]}
                      />
                      <Bar
                        dataKey="reputation"
                        fill="url(#colorIp)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      >
                        {ipScans.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          {/* Domain Scan Chart */}
          {domainScans.length > 0 && (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaGlobe className="mr-2 text-pink-500" />
                  Domain Safety Distribution
                </h2>
                <span className="text-sm text-gray-500">
                  Last {domainScans.length} scans
                </span>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="90%"
                    data={domainScans.map((scan) => ({
                      name: scan.domain,
                      value: scan.score,
                      fill: SAFETY_COLORS[getSafetyStatus(scan.score)],
                    }))}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: "insideStart", fill: "#fff" }}
                      background
                      dataKey="value"
                      animationDuration={1500}
                    />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value, entry, index) => {
                        const domain =
                          domainScans[index]?.domain || `Domain ${index + 1}`;
                        return (
                          <span className="text-gray-600">
                            {domain}: {domainScans[index]?.score || 0}%
                          </span>
                        );
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Safety Score"]}
                      labelFormatter={(label) => `Domain: ${label}`}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Security Scans
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    ...urlScans
                      .slice(0, 3)
                      .map((scan) => ({ ...scan, type: "URL" })),
                    ...ipScans
                      .slice(0, 3)
                      .map((scan) => ({ ...scan, type: "IP" })),
                    ...domainScans
                      .slice(0, 3)
                      .map((scan) => ({ ...scan, type: "Domain" })),
                  ]
                    .filter((scan) => scan)
                    .map((scan, index) => {
                      const score =
                        scan.maliciousScore ||
                        scan.reputation ||
                        scan.score ||
                        0;
                      const status = getSafetyStatus(score);

                      return (
                        <motion.tr
                          key={index}
                          className="hover:bg-gray-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.7 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {scan.type === "URL" ? (
                                <FaLink className="flex-shrink-0 h-5 w-5 text-indigo-500" />
                              ) : scan.type === "IP" ? (
                                <FaShieldAlt className="flex-shrink-0 h-5 w-5 text-purple-500" />
                              ) : (
                                <FaGlobe className="flex-shrink-0 h-5 w-5 text-pink-500" />
                              )}
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {scan.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {scan.url || scan.ip || scan.domain || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  status === "safe"
                                    ? "bg-green-100 text-green-800"
                                    : status === "moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              whileHover={{ scale: 1.1 }}
                            >
                              {status.toUpperCase()}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {score}%
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <p className="text-lg">
            No scan history available. Start by scanning some URLs, IPs, or
            domains.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
