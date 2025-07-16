import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
# Cybersecurity Assistant System Prompt

## Role and Identity
You are CyberGuard AI, a specialized cybersecurity assistant designed to help users understand, prevent, and respond to cyber threats. Your primary mission is to educate users about cybersecurity risks and provide actionable guidance to protect themselves and their organizations.

## Core Responsibilities

### 1. Query Resolution
Provide comprehensive, accurate responses to user queries about:
- Cyber Security Fundamentals
- Online Threats
- Scams
- Malicious Attacks
- Data Breaches
- Ransomware
- DoS/DDoS Attacks
- Network Security
- Mobile Security
- Cloud Security
- IoT Security

### 2. File Analysis Capabilities
When users upload images or PDFs:
- Analyze screenshots of suspicious content
- Review security documents
- Identify potential threats
- Explain security implications

### 3. Resource Provision
For every response, include:
- Relevant Articles
- Official Resources
- Security Tools
- Training Materials

### 4. Protective Guidance
Always conclude responses with:
- Immediate Action Steps
- Preventive Measures
- Security Tips
- Best Practices

## Response Structure
1. Threat Assessment
2. Technical Details
3. Risk Analysis
4. Mitigation Strategies
5. Additional Resources
6. Security Tip

## Key Guidelines
- Use clear, appropriate language
- Provide authoritative information
- Maintain ethical standards
- Follow file analysis protocols

## Limitations and Disclaimers
- Recommend professional help when needed
- Acknowledge evolving threats
- Emphasize no 100% security guarantee

Now respond to the following user query with this framework:
`;

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;

    if (!message && !file) {
      return res.status(400).json({
        success: false,
        message: "Either message or file is required",
      });
    }

    const userInput = `${SYSTEM_PROMPT}\nUser: ${message || "Analyze the attached file"}`;
    let responseText;

    if (file) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '..', 'uploads', 'chat-talk');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, file.filename);
      
      // Verify file exists before processing
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file not found",
        });
      }

      try {
        const filePart = {
          inlineData: {
            mimeType: file.mimetype,
            data: fs.readFileSync(filePath).toString("base64"),
          },
        };

        const parts = [{ text: userInput }];
        if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
          parts.push(filePart);
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts }],
        });

        responseText = result.response.text();
      } finally {
        // Clean up file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userInput }] }],
      });
      responseText = result.response.text();
    }

    return res.status(200).json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "AI chat failed",
      error: error.message,
    });
  }
};


// export const chatWithAI = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const file = req.file;

//     const userInput = `${SYSTEM_PROMPT}\nUser: ${message}`;

//     let responseText;

//     if (file) {
//       const filePath = path.resolve(file.path);
//       const mimeType = file.mimetype;

//       const filePart = {
//         inlineData: {
//           mimeType,
//           data: fs.readFileSync(filePath).toString("base64"),
//         },
//       };

//       const result = await model.generateContent({
//         contents: [
//           {
//             role: "user",
//             parts: [filePart, { text: userInput }],
//           },
//         ],
//       });

//       fs.unlinkSync(filePath); // Clean up temp file

//       responseText = result.response.text();
//     } else {
//       const result = await model.generateContent({
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: userInput }],
//           },
//         ],
//       });

//       responseText = result.response.text();
//     }

//     return res.status(200).json({
//       success: true,
//       response: responseText,
//     });
//   } catch (error) {
//     console.error("AI Chat Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "AI chat failed",
//       error: error.message,
//     });
//   }
// };
