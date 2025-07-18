import React, { useState, useRef } from "react";
import axios from "axios";
import {
  FaPaperclip,
  FaPaperPlane,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const AiChat = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const cleanResponse = (text) => {
  // First, clean the text from unwanted characters
  let cleaned = text
    .replace(/[*#_~`]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "");

  // Enhanced formatting for different response types
  cleaned = cleaned
    // Format lists (both numbered and bulleted)
    .replace(/^\s*(\d+\.|\-|\*)\s+(.+)$/gm, (match, bullet, content) => {
      return `<div class="flex items-start mb-1"><span class="mr-2">${bullet === '-' || bullet === '*' ? '•' : bullet}</span><span>${content}</span></div>`;
    })
    // Format code blocks with syntax highlighting
    .replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 p-3 rounded-lg text-green-400 overflow-x-auto my-2 font-mono text-sm"><code>${code}</code></pre>`;
    })
    // Format inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-cyan-300 font-mono text-sm">$1</code>')
    // Format headers
    .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level} class="text-${7-level}xl font-bold mb-2 mt-4 text-cyan-300">${content}</h${level}>`;
    })
    // Format bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-cyan-200">$1</strong>')
    // Format italic text
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Format links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Format blockquotes
    .replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-cyan-500 pl-4 my-2 text-gray-300 italic">$1</blockquote>')
    // Format tables (basic)
    .replace(/\|(.+?)\|/g, (match, content) => {
      if (content.includes('---')) return ''; // Skip separator rows
      return `<div class="grid grid-cols-${content.split('|').length - 1} gap-2 mb-2">${
        content.split('|').slice(1, -1).map(cell => 
          `<div class="p-2 bg-gray-800 rounded">${cell.trim()}</div>`
        ).join('')
      }</div>`;
    })
    // Convert line breaks to HTML
    .replace(/\n/g, '<br>');

  return cleaned;
};

  const handleSend = async () => {
    if (!query.trim() && !file) return;

    // Add user message (text + optional file name)
    const userMessage = {
      sender: "user",
      text: query || "[Uploaded File]",
      fileName: file?.name || null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

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
          { sender: "ai", text: cleanedResponse },
        ]);
      } else {
        toast.error("AI failed to respond");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error communicating with AI");
      setMessages((prev) => prev.filter((msg) => msg !== userMessage));
    } finally {
      setLoading(false);
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  const downloadChatPDF = async () => {
    if (messages.length === 0) {
      toast.warning("No chat history to download");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(40);
    pdf.setTextColor(200, 200, 200);
    pdf.text("GG ki Suraksha", pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 204);
    pdf.text("GG ki Suraksha - Chat History", pageWidth / 2, 20, {
      align: "center",
    });
    pdf.setFontSize(12);

    let y = 40;
    const lineHeight = 10;
    const margin = 20;

    messages.forEach((msg) => {
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = 20;
      }

      pdf.setTextColor(msg.sender === "user" ? 0 : 0, msg.sender === "user" ? 0 : 128, msg.sender === "user" ? 255 : 0);
      pdf.text(`${msg.sender === "user" ? "You" : "AI Assistant"}:`, margin, y);
      y += lineHeight;

      const lines = pdf.splitTextToSize(msg.text, pageWidth - 2 * margin);
      pdf.text(lines, margin, y);
      y += lines.length * lineHeight + 5;

      if (msg.fileName) {
        pdf.setTextColor(100, 100, 100);
        pdf.text(`📎 Attached File: ${msg.fileName}`, margin, y);
        y += lineHeight;
      }
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.text("gg gg@123gmail.com +91 9638552 74", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
    }

    pdf.save("GG_ki_Suraksha_Chat_History.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🛡️ AI Security Assistant
        </h2>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash /> Clear
          </button>
          <button
            onClick={downloadChatPDF}
            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <FaDownload /> Save
          </button>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[70vh] pr-2"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-2xl max-w-3xl ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-blue-600 to-cyan-600 rounded-tr-none"
                  : "bg-gray-700 rounded-tl-none"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(
                      /```(.*?)```/gs,
                      "<pre class='bg-gray-900 p-3 rounded-lg text-green-400 overflow-x-auto my-2'>$1</pre>"
                    )
                    .replace(/\n/g, "<br>"),
                }}
              />
              {msg.fileName && (
                <div className="mt-2 text-sm text-cyan-300">
                  📎 Uploaded: <span className="italic">{msg.fileName}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="p-4 rounded-2xl bg-gray-700 rounded-tl-none max-w-md w-full">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-8 h-8 object-contain"
                    src="/loader.mp4"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-600 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`mt-4 p-4 rounded-xl border-2 border-dashed ${
          isDragging ? "border-cyan-400 bg-gray-800" : "border-gray-600"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file && (
          <div className="flex items-center justify-between mb-3 p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <FaPaperclip className="mr-2 text-cyan-400" />
              <span className="truncate max-w-xs">{file.name}</span>
            </div>
            <button
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
              className="w-full p-3 pr-12 rounded-xl bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
            <button
              onClick={triggerFileInput}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 p-2"
              title="Attach file"
            >
              <FaPaperclip />
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
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <FaPaperPlane />
          </button>
        </div>

        <div className="text-center text-sm text-gray-400 mt-2">
          {isDragging
            ? "Drop your file here"
            : "Drag & drop files here or click to upload"}
        </div>
      </div>
    </div>
  );
};

export default AiChat;
