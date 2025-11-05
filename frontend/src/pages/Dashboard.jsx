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
  LineChart,
  Line,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiDownload,
  FiClock,
  FiCalendar,
  FiUser,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { FaShieldAlt, FaGlobe, FaLink, FaServer } from "react-icons/fa";

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [urlScans, setUrlScans] = useState([]);
  const [ipScans, setIpScans] = useState([]);
  const [domainScans, setDomainScans] = useState([]);
  const [timeInfo, setTimeInfo] = useState({ time: "", date: "", weekday: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced color schemes for dark theme
  const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
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

      const processedUrlScans = (urlRes.data?.scans || [])
        .map((scan) => ({
          ...scan,
          url: scan.url || "Unknown URL",
          maliciousScore: scan.maliciousScore || 0,
        }))
        .slice(0, 10);

      const processedIpScans = (ipRes.data?.data || [])
        .map((scan) => ({
          ...scan,
          ip: scan.ip || "Unknown IP",
          reputation: scan.reputation || 0,
        }))
        .slice(0, 10);

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

  const getTimeData = () => {
    const now = new Date();
    setTimeInfo({
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      weekday: now.toLocaleDateString(undefined, { weekday: "long" }),
    });
  };

  const generatePdf = async () => {
    try {
      const button = document.querySelector("[data-pdf-button]");
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="animate-pulse">Generating...</span>';
      }

      const dashboardElement = document.getElementById("dashboard-section");
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#0f172a",
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setProperties({
        title: `${user.name || "User"} Security Report`,
        subject: "Security Dashboard Export",
        author: "CyberSec Dashboard",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 20;
      const imgHeight = imgWidth * ratio;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("SECURITY DASHBOARD", pageWidth / 2, 30, { align: "center" });

      pdf.setFontSize(14);
      pdf.text(`${user.name || "User"}`, pageWidth / 2, 45, { align: "center" });
      pdf.text(`${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: "center" });

      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight, undefined, "FAST");

      pdf.save(`security-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      const button = document.querySelector("[data-pdf-button]");
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span class="flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF</span>';
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

  const calculateThreatLevel = () => {
    const allScans = [...urlScans, ...ipScans, ...domainScans];
    const dangerousCount = allScans.filter(scan => {
      const score = scan.maliciousScore || scan.reputation || scan.score || 0;
      return score >= 70;
    }).length;
    
    if (dangerousCount === 0) return { level: "Secure", color: "from-green-500 to-emerald-600", icon: FiCheckCircle };
    if (dangerousCount < 3) return { level: "Moderate", color: "from-yellow-500 to-orange-600", icon: FiAlertTriangle };
    return { level: "High Risk", color: "from-red-500 to-rose-600", icon: FiXCircle };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-400"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full h-32 w-32 border-r-4 border-l-4 border-purple-400"
          />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-xl max-w-md backdrop-blur-sm"
        >
          <div className="flex items-center mb-2">
            <FiXCircle className="text-2xl mr-3" />
            <strong className="text-lg">Error</strong>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  const threatLevel = calculateThreatLevel();
  const ThreatIcon = threatLevel.icon;

  const stats = [
    {
      title: "Total Scans",
      value: urlScans.length + ipScans.length + domainScans.length,
      icon: <FiActivity className="text-cyan-400 text-2xl" />,
      color: "from-cyan-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "URLs Analyzed",
      value: urlScans.length,
      icon: <FaLink className="text-purple-400 text-2xl" />,
      color: "from-purple-500 to-pink-600",
      change: "+8%",
    },
    {
      title: "IPs Checked",
      value: ipScans.length,
      icon: <FaServer className="text-emerald-400 text-2xl" />,
      color: "from-emerald-500 to-teal-600",
      change: "+5%",
    },
    {
      title: "Domains Verified",
      value: domainScans.length,
      icon: <FaGlobe className="text-orange-400 text-2xl" />,
      color: "from-orange-500 to-red-600",
      change: "+15%",
    },
  ];

  const safeCount = urlScans.filter(s => (s.maliciousScore || 0) < 30).length;
  const warningCount = urlScans.filter(s => (s.maliciousScore || 0) >= 30 && (s.maliciousScore || 0) < 70).length;
  const dangerCount = urlScans.filter(s => (s.maliciousScore || 0) >= 70).length;

  const threatDistribution = [
    { name: "Safe", value: safeCount, color: "#10B981" },
    { name: "Warning", value: warningCount, color: "#F59E0B" },
    { name: "Dangerous", value: dangerCount, color: "#EF4444" },
  ].filter(item => item.value > 0);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
      id="dashboard-section"
    >
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <motion.h1 
                className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {greeting()}, {user.name || "User"}
              </motion.h1>
              <motion.p 
                className="text-slate-400 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FiUser className="text-cyan-400" />
                {user.email || "user@example.com"}
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-6 py-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="text-purple-400" />
                  <div>
                    <p className="text-slate-400">{timeInfo.weekday}</p>
                    <p className="font-semibold">{timeInfo.date}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-6 py-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <FiClock className="text-cyan-400" />
                  <div>
                    <p className="text-slate-400">Current Time</p>
                    <p className="font-semibold font-mono">{timeInfo.time}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <motion.a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=gghelp@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiMail className="text-cyan-400" />
              <span>Contact Support</span>
            </motion.a>
            <motion.button
              onClick={generatePdf}
              data-pdf-button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiDownload />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Threat Level Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-8 bg-gradient-to-r ${threatLevel.color} p-6 rounded-2xl shadow-2xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <ThreatIcon className="text-4xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Overall Threat Level: {threatLevel.level}</h3>
                <p className="text-white/80 mt-1">System security status based on recent scans</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <FaShieldAlt className="text-6xl opacity-20" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-slate-900/50 p-3 rounded-xl">
                    {stat.icon}
                  </div>
                  <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                </div>
                <h3 className="text-slate-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        {(urlScans.length > 0 || ipScans.length > 0 || domainScans.length > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Threat Distribution */}
            {threatDistribution.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                    <FiAlertTriangle />
                  </div>
                  Threat Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {threatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* URL Analysis */}
            {urlScans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <FaLink />
                  </div>
                  URL Safety Scores
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={urlScans.slice(0, 8)}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="url" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={(value) => {
                        try {
                          const urlObj = new URL(value);
                          return urlObj.hostname.substring(0, 15);
                        } catch {
                          return value.substring(0, 15);
                        }
                      }}
                    />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}%`, "Malicious Score"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="maliciousScore" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* IP Reputation */}
            {ipScans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                    <FaServer />
                  </div>
                  IP Reputation Analysis
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ipScans.slice(0, 8)}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="ip" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="reputation" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Domain Security */}
            {domainScans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                    <FaGlobe />
                  </div>
                  Domain Security Scores
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={domainScans.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="domain" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        ) : null}

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
              <FiActivity />
            </div>
            Recent Security Scans
          </h2>
          
          {(urlScans.length === 0 && ipScans.length === 0 && domainScans.length === 0) ? (
            <div className="text-center py-12">
              <FaShieldAlt className="text-6xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No scan history available yet</p>
              <p className="text-slate-500 mt-2">Start scanning URLs, IPs, or domains to see activity here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Type</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Target</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...urlScans.slice(0, 5).map((scan) => ({ ...scan, type: "URL" })),
                    ...ipScans.slice(0, 3).map((scan) => ({ ...scan, type: "IP" })),
                    ...domainScans.slice(0, 3).map((scan) => ({ ...scan, type: "Domain" })),
                  ]
                    .filter((scan) => scan)
                    .slice(0, 10)
                    .map((scan, index) => {
                      const score = scan.maliciousScore || scan.reputation || scan.score || 0;
                      const status = getSafetyStatus(score);

                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                scan.type === "URL" ? "bg-purple-500/20 text-purple-400" :
                                scan.type === "IP" ? "bg-cyan-500/20 text-cyan-400" :
                                "bg-emerald-500/20 text-emerald-400"
                              }`}>
                                {scan.type === "URL" ? <FaLink /> :
                                 scan.type === "IP" ? <FaServer /> :
                                 <FaGlobe />}
                              </div>
                              <span className="font-medium">{scan.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                            {scan.url || scan.ip || scan.domain || "N/A"}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              status === "safe" ? "bg-green-500/20 text-green-400" :
                              status === "moderate" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {status === "safe" ? "✓ SAFE" :
                               status === "moderate" ? "⚠ WARNING" :
                               "✗ DANGER"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 1, delay: index * 0.05 }}
                                  className={`h-full ${
                                    status === "safe" ? "bg-gradient-to-r from-green-400 to-green-600" :
                                    status === "moderate" ? "bg-gradient-to-r from-yellow-400 to-orange-600" :
                                    "bg-gradient-to-r from-red-400 to-red-600"
                                  }`}
                                />
                              </div>
                              <span className="font-mono font-semibold min-w-[3rem] text-right">{score}%</span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-slate-500 text-sm"
        >
          <p>© 2024 CyberSec Dashboard. All rights reserved.</p>
          <p className="mt-1">Your security is our priority 🛡️</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;