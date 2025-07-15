import React from 'react';
import { useNavigate } from 'react-router-dom';

const toolOptions = [
  {
    title: 'Scan URL',
    path: '/app/tools/scan-url', // ✅ Correct path
    description:
      'Analyze your URL using 70+ antivirus products and security tools to generate a threat score and context.',
  },
  {
    title: 'Domain Check',
    path: '/app/tools/domain-check',
    description:
      'Get reputation and threat data of a domain from 70+ antivirus tools and security datasets.',
  },
  {
    title: 'IP Address Scan',
    path: '/app/tools/ip-scan',
    description:
      'Get threat intelligence and reputation data for any IP address from security engines and datasets.',
  },
  {
    title: 'Upload File for Scan',
    path: '/app/tools/file-upload',
    description:
      'Scan your file using antivirus engines, sandboxes, and security tools to assess risk and behavior.',
  },
  {
    title: 'Get File Report by Hash',
    path: '/app/tools/hash-report',
    description:
      'Retrieve file scan results using md5/sha1/sha256 hash, checked across antivirus and sandbox tools.',
  },
];

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
            onClick={() => navigate(tool.path)} // ✅ Fixed
          >
            <h3 className="text-xl font-semibold mb-2 text-cyan-300">{tool.title}</h3>
            <p className="text-sm text-gray-400 min-h-[40px]">{tool.description}</p>

            {/* Optional Tooltip on hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/80 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 rounded-xl z-10 flex items-center justify-center text-center">
              {tool.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tools;
