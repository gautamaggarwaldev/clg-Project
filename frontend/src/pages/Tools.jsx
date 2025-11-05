import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  X,
  Zap,
  Globe,
  Link,
  Upload,
  Hash,
  Mail,
  Key,
  ArrowRight,
  Lock,
  Activity,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const toolOptions = [
  {
    title: "URL Scanner",
    path: "/app/tools/scan-url",
    description:
      "Advanced URL analysis using 70+ antivirus engines and security intelligence to detect malicious links and phishing attempts.",
    icon: <Link className="w-7 h-7" />,
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    iconBg: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    hoverGlow: "group-hover:shadow-cyan-500/50",
    stats: "70+ engines",
  },
  {
    title: "Domain Intelligence",
    path: "/app/tools/domain-check",
    description:
      "Comprehensive domain reputation analysis with real-time threat detection across multiple security databases and threat feeds.",
    icon: <Globe className="w-7 h-7" />,
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    iconBg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    hoverGlow: "group-hover:shadow-emerald-500/50",
    stats: "Real-time data",
  },
  {
    title: "IP Analysis",
    path: "/app/tools/ip-scan",
    description:
      "Deep IP address investigation with geolocation, reputation scoring, and threat intelligence from global security networks.",
    icon: <Zap className="w-7 h-7" />,
    gradient: "from-purple-500 via-violet-500 to-indigo-600",
    iconBg: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    hoverGlow: "group-hover:shadow-purple-500/50",
    stats: "Global coverage",
  },
  {
    title: "File Security Scan",
    path: "/app/tools/file-upload",
    description:
      "Multi-layer file analysis using advanced sandboxing, behavioral detection, and signature-based scanning technologies.",
    icon: <Upload className="w-7 h-7" />,
    gradient: "from-amber-500 via-orange-500 to-red-600",
    iconBg: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    hoverGlow: "group-hover:shadow-amber-500/50",
    stats: "Sandbox analysis",
  },
  {
    title: "Hash Lookup",
    path: "/app/tools/hash-report",
    description:
      "Instant file reputation lookup using cryptographic hashes (MD5/SHA1/SHA256) against comprehensive malware databases.",
    icon: <Hash className="w-7 h-7" />,
    gradient: "from-red-500 via-pink-500 to-rose-600",
    iconBg: "bg-red-500/10",
    borderColor: "border-red-500/20",
    hoverGlow: "group-hover:shadow-red-500/50",
    stats: "Instant results",
  },
  {
    title: "Dark Web Monitor",
    path: "/app/dark-web-scanner",
    description:
      "Monitor dark web marketplaces and forums for compromised credentials, leaked data, and potential security breaches.",
    icon: <Mail className="w-7 h-7" />,
    gradient: "from-violet-500 via-fuchsia-500 to-purple-600",
    iconBg: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    hoverGlow: "group-hover:shadow-violet-500/50",
    stats: "24/7 monitoring",
  },
  {
    title: "Password Forge",
    path: "/app/password-generator",
    description:
      "Enterprise-grade password generator with customizable complexity, entropy calculation, and security best practices.",
    icon: <Key className="w-7 h-7" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-600",
    iconBg: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverGlow: "group-hover:shadow-blue-500/50",
    stats: "Military-grade",
  },
];

const ChatBotIcon = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPopup(true);
      const timeout = setTimeout(() => {
        setShowPopup(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleClosePopup = (e) => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const handleNavigate = () => {
    setShowPopup(false);
    navigate("/app/tools/ai-chat");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
            
            <div className="relative p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AI Security Assistant</h3>
                    <p className="text-xs text-cyan-400">Online • Ready to help</p>
                  </div>
                </div>
                <button
                  onClick={handleClosePopup}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Need help with threat analysis or security questions? I'm here 24/7 to assist you!
              </p>
              
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigate}
                  className="w-full text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-between group"
                >
                  <span>Ask about latest threats</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigate}
                  className="w-full text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-xl transition-all border border-slate-600 flex items-center justify-between group"
                >
                  <span>Get security recommendations</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Icon with Pulse Effect */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        className="relative"
      >
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full"
        />
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNavigate}
          className="relative bg-gradient-to-br from-cyan-600 to-blue-600 p-5 rounded-full shadow-2xl cursor-pointer transition-all group hover:shadow-cyan-500/50"
        >
          <ShieldCheck className="text-white w-7 h-7 group-hover:rotate-12 transition-transform" />
          
          {!showPopup && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-xs font-bold">!</span>
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

const ToolCard = ({ tool, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={`group relative bg-slate-800/50 backdrop-blur-sm border ${tool.borderColor} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-opacity-50 ${tool.hoverGlow} shadow-xl overflow-hidden`}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        {/* Icon and Title Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={`${tool.iconBg} p-4 rounded-xl backdrop-blur-sm border border-white/10 text-white`}
            >
              {tool.icon}
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {tool.title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">{tool.stats}</span>
              </div>
            </div>
          </div>
          
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 5 }}
          >
            <ArrowRight className="text-cyan-400" size={24} />
          </motion.div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {tool.description}
        </p>

        {/* Action Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`bg-gradient-to-r ${tool.gradient} p-3 rounded-xl text-white text-sm font-semibold text-center opacity-0 group-hover:opacity-100 transition-all shadow-lg`}
        >
          Launch Tool →
        </motion.div>
      </div>

      {/* Hover line effect */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient}`}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const Tools = () => {
  const navigate = useNavigate();
  const [hoveredStat, setHoveredStat] = useState(null);

  const stats = [
    { label: "Active Tools", value: "7", icon: <Shield className="w-5 h-5" />, color: "text-cyan-400" },
    { label: "Total Scans", value: "1.2M+", icon: <Activity className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Threat Detection", value: "99.9%", icon: <Lock className="w-5 h-5" />, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-semibold backdrop-blur-sm">
                  Security Arsenal
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Security Tools
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-lg max-w-2xl"
              >
                Advanced threat detection and analysis powered by cutting-edge security intelligence
              </motion.p>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onHoverStart={() => setHoveredStat(index)}
                  onHoverEnd={() => setHoveredStat(null)}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 min-w-[120px] hover:border-slate-600 transition-all"
                >
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <ShieldCheck className="text-cyan-400 w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2 text-lg">Enterprise-Grade Protection</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our security tools integrate with over 70 antivirus engines and global threat intelligence databases, 
                  providing real-time protection against emerging cyber threats.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {toolOptions.map((tool, index) => (
            <ToolCard
              key={tool.title}
              tool={tool}
              index={index}
              onClick={() => navigate(tool.path)}
            />
          ))}
        </motion.div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl px-6 py-3">
            <p className="text-slate-400 text-sm">
              🛡️ Protected by military-grade encryption • 24/7 threat monitoring active
            </p>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Chatbot */}
      <ChatBotIcon />
    </div>
  );
};

export default Tools;