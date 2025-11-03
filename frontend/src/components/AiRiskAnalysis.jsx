import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AIRiskAnalysis = ({ scanType, stats, results, meta }) => {
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async () => {
    if (!stats || !results) {
      toast.error("Scan data is missing.");
      return;
    }

    setLoading(true);
    setAiReport("");

    try {
      const { data } = await axios.post("http://localhost:5005/v1/ai/analyze-report", {
      // const { data } = await axios.post("https://cs-qhmx.onrender.com/v1/ai/analyze-report", {
        scanType,
        stats,
        results,
        meta,
      });

      if (data.success) {
        setAiReport(data.analysis);
        toast.success("AI analysis complete!");
      } else {
        toast.error("Failed to get AI analysis.");
      }
    } catch (err) {
      toast.error("Error during AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Function to clean and format the AI response
  const formatAIResponse = (text) => {
    // Remove special formatting characters
    let cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
    
    // Split into sections if there are clear headings
    const sections = cleanedText.split(/(?=\n[A-Z][a-z]+:)/g);
    
    return sections.map((section, index) => {
      // Check if this is a heading line
      const isHeading = section.includes(':') && !section.includes('\n');
      const isList = section.trim().startsWith('-');
      
      if (isHeading) {
        const [heading, ...content] = section.split(':');
        return (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-semibold text-cyan-400 mb-2">{heading.trim()}:</h4>
            <p className="text-gray-300">{content.join(':').trim()}</p>
          </div>
        );
      } else if (isList) {
        const items = section.split('\n').filter(item => item.trim().startsWith('-'));
        return (
          <ul key={index} className="list-disc pl-5 mb-4 text-gray-300">
            {items.map((item, i) => (
              <li key={i} className="mb-1">{item.replace('-', '').trim()}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={index} className="text-gray-300 mb-4 whitespace-pre-wrap">
            {section.trim()}
          </p>
        );
      }
    });
  };

  return (
    <div className="mt-6 p-4 border border-cyan-700 bg-[#1E293B] rounded-xl">
      <button
        onClick={handleAIAnalysis}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors duration-200"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        ) : (
          "Analyze with AI"
        )}
      </button>

      {aiReport && (
        <div className="mt-4 bg-[#0f172a] p-4 rounded-lg border border-cyan-800/50">
          <h3 className="text-xl font-bold text-cyan-400 mb-3 pb-2 border-b border-cyan-800/50">
            AI Security Analysis
          </h3>
          <div className="space-y-3">
            {formatAIResponse(aiReport)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRiskAnalysis;