import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Shield, Send, Trash2, Download, Paperclip, X, Lock, Terminal, Activity, AlertTriangle } from "lucide-react";

const CyberSecurityChat = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [systemStatus, setSystemStatus] = useState("SECURE");
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    const text = "SYSTEM INITIALIZED • ENCRYPTION ACTIVE";
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypingText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const cleanResponse = (text) => {
    let cleaned = text
      .replace(/[*#_~`]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "");

    cleaned = cleaned
      .replace(/^\s*(\d+\.|\-|\*)\s+(.+)$/gm, (match, bullet, content) => {
        return `<div class="flex items-start mb-2 pl-2"><span class="mr-3 text-cyan-400 font-mono">${bullet === '-' || bullet === '*' ? '▸' : bullet}</span><span class="text-gray-200">${content}</span></div>`;
      })
      .replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<pre class="bg-black/50 border border-cyan-500/30 p-4 rounded-lg text-green-400 overflow-x-auto my-3 font-mono text-sm shadow-lg shadow-cyan-500/10"><code>${code}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code class="bg-cyan-950/50 border border-cyan-500/30 px-2 py-1 rounded text-cyan-300 font-mono text-sm">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-cyan-300">$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');

    return cleaned;
  };

  const handleSend = async () => {
    if (!query.trim() && !file) return;

    const userMessage = {
      sender: "user",
      text: query || "[File Uploaded]",
      fileName: file?.name || null,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setSystemStatus("PROCESSING");

    try {
      const formData = new FormData();
      formData.append("message", query);
      if (file) {
        formData.append("file", file);
      }

      const { data } = await axios.post(
        // "http://localhost:5005/v1/chat/talk",
        "https://cs-qhmx.onrender.com/v1/chat/talk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        const cleanedResponse = cleanResponse(data.response);
        setMessages((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: cleanedResponse,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: "⚠️ Security analysis failed. Please try again.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: "⚠️ Communication error. Unable to reach security server.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setMessages((prev) => prev.filter((msg) => msg !== userMessage));
    } finally {
      setLoading(false);
      setSystemStatus("SECURE");
      setFile(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      {/* Animated scanning line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>

      <div className="relative z-10 flex flex-col h-screen p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  SENTINEL AI
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Terminal className="w-3 h-3 text-green-400" />
                <p className="text-xs text-gray-400 font-mono">{typingText}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-xs font-mono text-green-400">{systemStatus}</span>
            </div>
            <button
              onClick={clearChat}
              className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 hover:bg-red-950/50 hover:border-red-500/50 transition-all duration-200 group"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
            </button>
            <button
              className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-950/50 hover:border-cyan-500/50 transition-all duration-200 group"
              title="Download chat"
            >
              <Download className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-cyan-500/30"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative mb-6">
                <Lock className="w-20 h-20 text-cyan-400/30" />
                <div className="absolute inset-0 bg-cyan-400/10 blur-2xl rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-3">Secure Communication Channel Active</h2>
              <p className="text-gray-500 max-w-md">Your queries are encrypted end-to-end. Ask about security threats, vulnerabilities, or best practices.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl">
                {[
                  "Analyze network security posture",
                  "Detect potential vulnerabilities",
                  "Review security protocols",
                  "Generate threat assessment"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-200 text-sm text-left group"
                  >
                    <span className="text-cyan-400 mr-2 group-hover:text-cyan-300">▸</span>
                    <span className="text-gray-300">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-3xl ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 backdrop-blur-sm"
                    : "bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
                } rounded-xl p-4 shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {msg.sender === "user" ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-cyan-400">U</span>
                    </div>
                  ) : (
                    <Shield className="w-5 h-5 text-cyan-400" />
                  )}
                  <span className="text-xs font-mono text-gray-400">{msg.timestamp}</span>
                </div>
                <div
                  className="text-gray-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                {msg.fileName && (
                  <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-mono">{msg.fileName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-md bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full"></div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2 bg-cyan-500/20 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-2 bg-cyan-500/20 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-cyan-400 font-mono mt-3">Analyzing security parameters...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className={`relative p-4 rounded-xl border-2 border-dashed backdrop-blur-sm transition-all duration-200 ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/20"
              : "border-slate-700 bg-slate-800/30"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file && (
            <div className="flex items-center justify-between mb-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300 truncate max-w-xs font-mono">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Enter security query..."
                className="w-full p-3 pr-12 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-gray-200 placeholder-gray-500 font-mono text-sm transition-all duration-200"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors p-1"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={loading}
              className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 font-mono mt-2">
            {isDragging ? (
              <span className="text-cyan-400">DROP FILE TO UPLOAD</span>
            ) : (
              "DRAG & DROP FILES • END-TO-END ENCRYPTED"
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 font-mono flex items-center justify-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            CLASSIFIED SECURITY SYSTEM • ALL COMMUNICATIONS MONITORED
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-track-slate-800\/50::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .scrollbar-thumb-cyan-500\/30::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thumb-cyan-500\/30::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CyberSecurityChat;