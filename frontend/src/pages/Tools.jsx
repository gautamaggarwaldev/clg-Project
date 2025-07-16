import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

const toolOptions = [
  {
    title: "Scan URL",
    path: "/app/tools/scan-url",
    description:
      "Analyze your URL using 70+ antivirus products and security tools to generate a threat score and context.",
  },
  {
    title: "Domain Check",
    path: "/app/tools/domain-check",
    description:
      "Get reputation and threat data of a domain from 70+ antivirus tools and security datasets.",
  },
  {
    title: "IP Address Scan",
    path: "/app/tools/ip-scan",
    description:
      "Get threat intelligence and reputation data for any IP address from security engines and datasets.",
  },
  {
    title: "Upload File for Scan",
    path: "/app/tools/file-upload",
    description:
      "Scan your file using antivirus engines, sandboxes, and security tools to assess risk and behavior.",
  },
  {
    title: "Get File Report by Hash",
    path: "/app/tools/hash-report",
    description:
      "Retrieve file scan results using md5/sha1/sha256 hash, checked across antivirus and sandbox tools.",
  },
];

const ChatBotIcon = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup every 10 seconds
    const interval = setInterval(() => {
      setShowPopup(true);
      
      // Auto-hide after 8 seconds if not interacted with
      const timeout = setTimeout(() => {
        setShowPopup(false);
      }, 8000);
      
      return () => clearTimeout(timeout);
    }, 10000);

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
      {showPopup && (
        <div 
          className="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 animate-bounce"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Need help? 🛡️
            </h3>
            <button 
              onClick={handleClosePopup}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Ask me anything about security, threats, or best practices!
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleNavigate}
              className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white py-1 px-3 rounded-full transition"
            >
              Ask about recent threats
            </button>
            <button
              onClick={handleNavigate}
              className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded-full transition"
            >
              Security tips
            </button>
          </div>
        </div>
      )}

      {/* Chat Icon */}
      <div
        onClick={handleNavigate}
        className="relative bg-cyan-600 hover:bg-cyan-700 p-4 rounded-full shadow-lg cursor-pointer transition transform hover:scale-110"
      >
        <ShieldCheck className="text-white w-6 h-6" />
        {!showPopup && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 text-white">
      <h2 className="text-3xl font-bold mb-8 text-cyan-400">Security Tools</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {toolOptions.map((tool) => (
          <div
            key={tool.title}
            className="relative group border border-cyan-700 bg-[#1E293B] rounded-xl p-6 shadow-lg hover:shadow-cyan-600/50 transition duration-300 cursor-pointer"
            onClick={() => navigate(tool.path)}
          >
            <h3 className="text-xl font-semibold mb-2 text-cyan-300">
              {tool.title}
            </h3>
            <p className="text-sm text-gray-400 min-h-[40px]">
              {tool.description}
            </p>

            {/* Optional Tooltip on hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/80 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 rounded-xl z-10 flex items-center justify-center text-center">
              {tool.description}
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced Floating Chatbot Icon */}
      <ChatBotIcon />
    </div>
  );
};

export default Tools;