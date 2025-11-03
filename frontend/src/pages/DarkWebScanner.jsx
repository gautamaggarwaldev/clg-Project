import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

const DarkWebScanner = () => {
  const [email, setEmail] = useState("");
  const [breachData, setBreachData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }

    setLoading(true);
    setError("");
    setBreachData(null);

    try {
      const res = await axios.post(
        "http://localhost:5005/v1/dark-web-scanner/check-breach",
        // "https://cs-qhmx.onrender.com/v1/dark-web-scanner/check-breach",
        { email }
      );
      setBreachData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while checking the email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async () => {
    if (!breachData) return;

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Add title
      page.drawText("Dark Web Scan Report", {
        x: 50,
        y: height - 50,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Add scan details
      page.drawText(`Email: ${breachData.email}`, {
        x: 50,
        y: height - 80,
        size: 12,
        font,
      });

      page.drawText(`Scan Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: height - 100,
        size: 12,
        font,
      });

      page.drawText(`Status: ${breachData.found ? "Breach Found" : "No Breach Found"}`, {
        x: 50,
        y: height - 120,
        size: 12,
        font,
        color: breachData.found ? rgb(0.9, 0.2, 0.2) : rgb(0.2, 0.7, 0.2),
      });

      if (breachData.found) {
        page.drawText(`Breaches Found: ${breachData.results.length}`, {
          x: 50,
          y: height - 140,
          size: 12,
          font,
        });

        let yPosition = height - 180;
        breachData.results.forEach((result, index) => {
          if (yPosition < 100) {
            page.drawText("Continued on next page...", {
              x: 50,
              y: 50,
              size: 10,
              font,
              color: rgb(0.5, 0.5, 0.5),
            });
            yPosition = height - 50;
            pdfDoc.addPage([600, 800]);
          }

          page.drawText(`Breach #${index + 1}`, {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: rgb(0.9, 0.2, 0.2),
          });
          yPosition -= 20;

          page.drawText(`Source: ${result.sources || "Unknown"}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
          });
          yPosition -= 20;

          page.drawText(
            `Password: ${
              result.password ? result.password.replace(/./g, "*") : "N/A"
            }`,
            {
              x: 50,
              y: yPosition,
              size: 12,
              font,
            }
          );
          yPosition -= 20;

          if (result.sha1) {
            page.drawText(`SHA1 Hash: ${result.sha1}`, {
              x: 50,
              y: yPosition,
              size: 10,
              font,
            });
            yPosition -= 20;
          }

          if (result.hash) {
            page.drawText(`Hash: ${result.hash}`, {
              x: 50,
              y: yPosition,
              size: 10,
              font,
            });
            yPosition -= 30;
          }
        });
      } else {
        page.drawText("No breaches were found for this email address.", {
          x: 50,
          y: height - 160,
          size: 14,
          font: boldFont,
          color: rgb(0.2, 0.7, 0.2),
        });
        page.drawText("Recommendations:", {
          x: 50,
          y: height - 190,
          size: 12,
          font: boldFont,
        });
        page.drawText("- Continue using strong, unique passwords", {
          x: 50,
          y: height - 210,
          size: 12,
          font,
        });
        page.drawText("- Enable two-factor authentication where available", {
          x: 50,
          y: height - 230,
          size: 12,
          font,
        });
        page.drawText("- Regularly monitor your accounts for suspicious activity", {
          x: 50,
          y: height - 250,
          size: 12,
          font,
        });
      }

      const pages = pdfDoc.getPages();
      pages.forEach((pg) => {
        pg.drawText("CONFIDENTIAL", {
          x: 200,
          y: 400,
          size: 50,
          font: boldFont,
          color: rgb(0.9, 0.9, 0.9),
          rotate: Math.PI / 4,
          opacity: 0.3,
        });
      });

      pages[pages.length - 1].drawText(
        "Report generated by Dark Web Scanner - For security purposes only",
        {
          x: 50,
          y: 30,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        }
      );

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(
        blob,
        `dark-web-scan-${email.replace(/[@.]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF report.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Dark Web Email Scanner
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Check if your email has been compromised in any known data breaches
          </p>
        </motion.div>

        {/* Scanner Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-cyan-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full p-4 bg-gray-700 border border-cyan-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/30 text-white placeholder-gray-400 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleScan}
              disabled={loading}
              className={`px-6 py-4 rounded-lg font-medium shadow-lg transition-all ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scanning...
                </span>
              ) : (
                "Scan Email"
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-900/50 border-l-4 border-red-500 rounded-lg"
            >
              <p className="text-red-200">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {breachData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-xl p-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {breachData.found ? (
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
                        ⚠️ Breach Found!
                      </span>
                    ) : (
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
                        ✅ No Breach Found
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-300">
                    Scanned email: {breachData.email}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePdf}
                  className="mt-4 md:mt-0 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Download PDF
                </motion.button>
              </div>

              {breachData.found ? (
                <div className="overflow-hidden">
                  <div className="mb-4">
                    <p className="text-gray-300">
                      Found {breachData.results.length} breaches for this email
                      address.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                            Password
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                            SHA1 Hash
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                            Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                        {breachData.results.map((result, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-gray-700/30"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              {result.sources || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                              {result.password
                                ? result.password.replace(/./g, "*")
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                              <span className="truncate block max-w-xs">
                                {result.sha1 || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                              <span className="truncate block max-w-xs">
                                {result.hash || "N/A"}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-green-900/20 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-400 mt-1 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <p className="text-green-300">
                        No breaches found for {breachData.email}. Your email does
                        not appear in any known data breaches.
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-green-200 font-semibold">
                          Security Recommendations:
                        </p>
                        <ul className="text-sm text-green-300 list-disc pl-5 mt-2 space-y-1">
                          <li>Use strong, unique passwords for each account</li>
                          <li>
                            Enable two-factor authentication where available
                          </li>
                          <li>
                            Regularly monitor your accounts for suspicious
                            activity
                          </li>
                          <li>Consider using a password manager</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-6 border-t border-gray-700 text-center"
        >
          <p className="text-sm text-gray-400">
            Note: This scanner checks against known data breaches. For
            comprehensive protection, use unique passwords for each service and
            enable two-factor authentication.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DarkWebScanner;