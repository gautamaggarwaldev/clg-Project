import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeReport = async (req, res) => {
  try {
    const { scanType, stats, results, meta } = req.body;

    if (!stats || !results) {
      return res.status(400).json({ success: false, message: "Missing data for analysis." });
    }

    // Convert data to human-readable string
    const summary = `
    🔍 Scan Type: ${scanType}
    📊 Stats: ${JSON.stringify(stats, null, 2)}
    🧪 Engine Results: ${JSON.stringify(results, null, 2)}
    🔧 Meta: ${meta ? JSON.stringify(meta, null, 2) : "N/A"}
    `;

    const prompt = `
You are a cybersecurity AI assistant.

Analyze the following scan report and:
- Summarize threat level
- Explain major detection results
- Highlight malicious/suspicious patterns
- Recommend 2–3 actionable security steps

Be clear and professional. Avoid technical jargon where not needed.

Report:
${summary}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiAnalysis = response.text();

    res.status(200).json({ success: true, analysis: aiAnalysis });
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to analyze scan." });
  }
};

export async function generateDomainReport(domainData) {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prepare the prompt with the domain data
    const prompt = createPrompt(domainData);
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response (assuming it returns JSON)
    let summary;
    try {
      summary = JSON.parse(text);
    } catch (e) {
      // If not JSON, use as plain text
      summary = { summary: text };
    }
    
    return {
      success: true,
      message: "AI summary generated successfully",
      data: summary
    };
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return {
      success: false,
      message: "Failed to generate AI summary",
      error: error.message
    };
  }
}

export function createPrompt(domainData) {
  const { attributes } = domainData.data.data;
  
  // Extract key information
  const domainInfo = {
    domain: attributes.rdap.ldh_name,
    registrationDate: attributes.rdap.events.find(e => e.event_action === 'registration')?.event_date,
    expirationDate: attributes.rdap.events.find(e => e.event_action === 'expiration')?.event_date,
    registrar: attributes.rdap.entities.find(e => e.roles.includes('registrar'))?.vcard_array.find(v => v.name === 'fn')?.values[0],
    nameServers: attributes.rdap.nameservers.map(ns => ns.ldh_name),
    
    dnsRecords: attributes.last_dns_records.map(record => ({
      type: record.type,
      value: record.value,
      ttl: record.ttl
    })),
    reputation: attributes.reputation,
    tags: attributes.tags,
    categories: attributes.categories
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
    "sslAnalysis": {
      "certificateAuthority": "Who issued the certificate",
      "validityPeriod": "Certificate validity period analysis",
      "subjectAltNames": "Analysis of subject alternative names"
    },
    "riskAssessment": {
      "overallRisk": "Low/Medium/High",
      "recommendations": ["List of recommendations"]
    },
    "conclusion": "Final summary and conclusion"
  }

  Domain Data:
  ${JSON.stringify(domainInfo, null, 2)}

  Provide the response in valid JSON format only, without any additional text or markdown.
  `;
}
