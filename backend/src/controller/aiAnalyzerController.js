import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with better error handling
const initializeGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables");
    return null;
  }
  
  console.log("✅ GEMINI_API_KEY found, initializing GenAI...");
  return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGenAI();

export const analyzeReport = async (req, res) => {
  try {
    // Check if GenAI was initialized
    if (!genAI) {
      console.error("GenAI not initialized - API key missing");
      return res.status(500).json({ 
        success: false, 
        message: "AI service not configured. Please check server configuration." 
      });
    }

    const { scanType, stats, results, meta } = req.body;

    // Validate input
    if (!stats || !results) {
      console.log("Missing required data:", { hasStats: !!stats, hasResults: !!results });
      return res.status(400).json({ 
        success: false, 
        message: "Missing data for analysis." 
      });
    }

    console.log("Starting AI analysis for scan type:", scanType);

    // Convert data to human-readable string
    const summary = `
🔍 Scan Type: ${scanType}
📊 Stats: ${JSON.stringify(stats, null, 2)}
🧪 Engine Results (First 5): ${JSON.stringify(Object.entries(results).slice(0, 5), null, 2)}
🔧 Meta: ${meta ? JSON.stringify(meta, null, 2) : "N/A"}
    `;

    const prompt = `
You are a cybersecurity AI assistant analyzing a security scan report.

Analyze the following scan report and provide a clear, structured response with:

1. **Threat Level Summary**: Overall risk assessment (Low/Medium/High/Critical)

2. **Key Findings**: 
   - Number of malicious detections and what they mean
   - Suspicious patterns or behaviors detected
   - Notable clean detections

3. **Security Recommendations** (2-3 actionable steps):
   - Specific actions the user should take
   - Preventive measures for the future

Be clear, professional, and avoid unnecessary technical jargon. Format your response with clear sections using markdown-style headers.

Report Data:
${summary}
`;

    console.log("Sending request to Gemini API...");
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiAnalysis = response.text();

    console.log("✅ AI analysis generated successfully");

    res.status(200).json({ 
      success: true, 
      analysis: aiAnalysis 
    });

  } catch (error) {
    console.error("❌ AI Analysis Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check for specific API errors
    if (error.message?.includes("API_KEY")) {
      return res.status(500).json({ 
        success: false, 
        message: "Invalid API key configuration." 
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return res.status(429).json({ 
        success: false, 
        message: "API rate limit exceeded. Please try again later." 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Failed to analyze scan. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export async function generateDomainReport(domainData) {
  try {
    if (!genAI) {
      throw new Error("AI service not initialized");
    }

    console.log("Generating domain report...");

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });
    
    // Prepare the prompt with the domain data
    const prompt = createPrompt(domainData);
    
    console.log("Sending domain analysis request to Gemini...");
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Domain report generated");
    
    // Parse the response (assuming it returns JSON)
    let summary;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      summary = JSON.parse(cleanedText);
    } catch (e) {
      console.log("Response not in JSON format, using as plain text");
      // If not JSON, use as plain text
      summary = { summary: text };
    }
    
    return {
      success: true,
      message: "AI summary generated successfully",
      data: summary
    };
  } catch (error) {
    console.error("❌ Error generating AI summary:", error);
    return {
      success: false,
      message: "Failed to generate AI summary",
      error: error.message
    };
  }
}

export function createPrompt(domainData) {
  try {
    const { attributes } = domainData.data.data;
    
    // Extract key information with null checks
    const domainInfo = {
      domain: attributes.rdap?.ldh_name || "Unknown",
      registrationDate: attributes.rdap?.events?.find(e => e.event_action === 'registration')?.event_date || "Unknown",
      expirationDate: attributes.rdap?.events?.find(e => e.event_action === 'expiration')?.event_date || "Unknown",
      registrar: attributes.rdap?.entities?.find(e => e.roles?.includes('registrar'))?.vcard_array?.find(v => v.name === 'fn')?.values?.[0] || "Unknown",
      nameServers: attributes.rdap?.nameservers?.map(ns => ns.ldh_name) || [],
      
      dnsRecords: attributes.last_dns_records?.map(record => ({
        type: record.type,
        value: record.value,
        ttl: record.ttl
      })) || [],
      reputation: attributes.reputation || "Unknown",
      tags: attributes.tags || [],
      categories: attributes.categories || {}
    };

    return `
Analyze this domain information and provide a comprehensive security report in JSON format with the following structure:
{
  "overview": "Brief overview of the domain",
  "registrationDetails": {
    "registrar": "Registrar information",
    "registrationDate": "When the domain was registered",
    "expirationDate": "When the domain expires",
    "age": "How old the domain is"
  },
  "securityAnalysis": {
    "reputationScore": "Analysis of the reputation score",
    "threatDetection": {
      "malicious": "Analysis of malicious detections",
      "suspicious": "Analysis of suspicious detections",
      "harmless": "Analysis of harmless detections"
    },
    "notableFindings": "Any notable security findings"
  },
  "dnsAnalysis": {
    "nameServers": "Analysis of name servers",
    "recordTypes": "Analysis of DNS record types",
    "notableRecords": "Any notable DNS records"
  },
  "riskAssessment": {
    "overallRisk": "Low/Medium/High",
    "recommendations": ["List of recommendations"]
  },
  "conclusion": "Final summary and conclusion"
}

Domain Data:
${JSON.stringify(domainInfo, null, 2)}

Provide the response in valid JSON format only, without any additional text or markdown code blocks.
`;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
}