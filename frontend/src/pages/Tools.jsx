import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShieldCheck, X, Zap, Globe, Link, Upload, Hash, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const toolOptions = [
  {
    title: "Scan URL",
    path: "/app/tools/scan-url",
    description: "Analyze your URL using 70+ antivirus products and security tools to generate a threat score and context.",
    icon: <Link className="w-6 h-6 text-cyan-400" />,
    color: "from-cyan-500 to-blue-600"
  },
  {
    title: "Domain Check",
    path: "/app/tools/domain-check",
    description: "Get reputation and threat data of a domain from 70+ antivirus tools and security datasets.",
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    color: "from-emerald-500 to-green-600"
  },
  {
    title: "IP Address Scan",
    path: "/app/tools/ip-scan",
    description: "Get threat intelligence and reputation data for any IP address from security engines and datasets.",
    icon: <Zap className="w-6 h-6 text-purple-400" />,
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "Upload File for Scan",
    path: "/app/tools/file-upload",
    description: "Scan your file using antivirus engines, sandboxes, and security tools to assess risk and behavior.",
    icon: <Upload className="w-6 h-6 text-amber-400" />,
    color: "from-amber-500 to-yellow-600"
  },
  {
    title: "Get File Report by Hash",
    path: "/app/tools/hash-report",
    description: "Retrieve file scan results using md5/sha1/sha256 hash, checked across antivirus and sandbox tools.",
    icon: <Hash className="w-6 h-6 text-red-400" />,
    color: "from-red-500 to-pink-600"
  },
  {
    title: "Dark Web Email Scanner",
    path: "/app/dark-web-scanner",
    description: "A Dark Web Scanner via Email detects and alerts users if their email appears in leaked or compromised data on the dark web.",
    icon: <Mail className="w-6 h-6 text-violet-400" />,
    color: "from-violet-500 to-fuchsia-600"
  },
];

const ChatBotIcon = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup every 15 seconds
    const interval = setInterval(() => {
      setShowPopup(true);

      // Auto-hide after 8 seconds if not interacted with
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Message */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-400" />
                Security Assistant
              </h3>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Ask me anything about security, threats, or best practices!
            </p>
            <div className="flex flex-col space-y-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigate}
                className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg transition-all shadow-md"
              >
                Ask about recent threats
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigate}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg transition-all shadow-md"
              >
                Security tips
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNavigate}
        className="relative bg-gradient-to-br from-cyan-600 to-blue-600 p-4 rounded-full shadow-xl cursor-pointer transition-all group"
      >
        <ShieldCheck className="text-white w-6 h-6 group-hover:rotate-12 transition-transform" />
        {!showPopup && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm"
          >
            <span className="text-white text-xs">!</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const ToolCard = ({ tool, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group bg-gradient-to-br ${tool.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            {tool.icon}
          </div>
          <h3 className="text-xl font-bold text-white">{tool.title}</h3>
        </div>
        <p className="text-sm text-white/80">{tool.description}</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/80 p-4"
      >
        <p className="text-white text-sm text-center">{tool.description}</p>
      </motion.div>
    </motion.div>
  );
};

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              Security Tools
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400"
            >
              Comprehensive security analysis tools at your fingertips
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 md:mt-0"
          >
            <div className="relative">
              <motion.div
                animate={{
                  x: [0, 5, -5, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -left-2 -top-2 w-4 h-4 bg-cyan-400 rounded-full opacity-70"
              />
              <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 relative z-10">
                <span className="text-sm text-gray-300">6 tools available</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, staggerChildren: 0.1 }}
        >
          {toolOptions.map((tool, index) => (
            <ToolCard 
              key={tool.title}
              tool={tool}
              onClick={() => navigate(tool.path)}
              custom={index}
            />
          ))}
        </motion.div>

        {/* Enhanced Floating Chatbot Icon */}
        <ChatBotIcon />
      </motion.div>
    </div>
  );
};

export default Tools;