import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
        // "http://localhost:5005/v1/dark-web-scanner/check-breach",
        "https://cs-qhmx.onrender.com/v1/dark-web-scanner/check-breach",
        { email }
      );
      console.log("Breach response:", res.data);
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

      // Only add breach results if breaches were found
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
        // Add clean report message
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

      // Add watermark
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

      // Add footer
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8 dark:bg-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        🔍 Dark Web Email Scanner
      </h2>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          onClick={handleScan}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
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
            </>
          ) : (
            "Scan Email"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          <p>{error}</p>
        </div>
      )}

      {breachData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold dark:text-white">
              {breachData.found ? (
                <span className="text-red-600 dark:text-red-400">
                  ⚠️ Breach Found!
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  ✅ No Breach Found
                </span>
              )}
            </h3>
            <button
              onClick={generatePdf}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors flex items-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Download PDF Report
            </button>
          </div>

          {breachData.found ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Password
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      SHA1 Hash
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {breachData.results.map((result, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-700"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {result.sources || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">
                        {result.password
                          ? result.password.replace(/./g, "*")
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">
                        <span className="truncate block max-w-xs">
                          {result.sha1 || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">
                        <span className="truncate block max-w-xs">
                          {result.hash || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Found {breachData.results.length} breaches for this email
                address.
              </div>
            </div>
          ) : (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900 dark:border-green-700">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400 mr-2"
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
                <p className="text-green-800 dark:text-green-200">
                  No breaches found for {breachData.email}. Your email does not
                  appear in any known data breaches.
                </p>
              </div>
              <div className="mt-4 pl-8">
                <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                  Security Recommendations:
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 list-disc pl-5 mt-2 space-y-1">
                  <li>Use strong, unique passwords for each account</li>
                  <li>Enable two-factor authentication where available</li>
                  <li>Regularly monitor your accounts for suspicious activity</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Note: This scanner checks against known data breaches. For
          comprehensive protection, use unique passwords for each service and
          enable two-factor authentication.
        </p>
      </div>
    </div>
  );
};

export default DarkWebScanner;