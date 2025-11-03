import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AIDomainReport = ({ domainData }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async () => {
    setLoading(true);
    setSummary(null);

    try {
      const res = await axios.post("http://localhost:5005/v1/ai/domain-summary", domainData);
      // const res = await axios.post("https://cs-qhmx.onrender.com/v1/ai/domain-summary", domainData);
      if (res.data.success) {
        const summaryText = res.data.data.summary;

        // Sometimes the response is wrapped in ```json ... ```
        const cleanedText = summaryText.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(cleanedText);
        setSummary(parsed);
        toast.success("AI summary generated!");
      } else {
        toast.error("Failed to get AI summary.");
      }
    } catch (err) {
      console.error("AI Summary Error:", err);
      toast.error("Error generating AI summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E293B] text-white mt-6 p-6 rounded-xl border border-cyan-700 shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">AI Risk Analysis</h2>

      <button
        onClick={handleAIAnalysis}
        className="mb-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Generate AI Summary"}
      </button>

      {summary && (
        <div className="space-y-4 text-sm text-gray-300">
          {Object.entries(summary).map(([section, value]) => (
            <div key={section}>
              <h3 className="text-lg font-semibold text-cyan-400 capitalize">{section.replace(/([A-Z])/g, ' $1')}</h3>
              {typeof value === "string" ? (
                <p className="text-gray-300">{value}</p>
              ) : Array.isArray(value) ? (
                <ul className="list-disc list-inside">
                  {value.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc list-inside">
                  {Object.entries(value).map(([k, v]) => (
                    <li key={k}>
                      <strong className="text-cyan-400">{k}:</strong> {v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIDomainReport;
