import React, { useEffect, useState } from 'react';
import { getCyberNews } from '../api/news';
import { FaNewspaper, FaLock, FaShieldAlt, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CyberNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await getCyberNews();
        setArticles(news);
      } catch (err) {
        setError('Failed to load cybersecurity news.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter articles based on active tab and search query
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'hacking') return matchesSearch && 
      (article.title.toLowerCase().includes('hack') || 
       article.title.toLowerCase().includes('breach') ||
       article.title.toLowerCase().includes('attack'));
    if (activeTab === 'privacy') return matchesSearch && 
      (article.title.toLowerCase().includes('privacy') || 
       article.title.toLowerCase().includes('gdpr') ||
       article.title.toLowerCase().includes('data protection'));
    return matchesSearch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Security icons
  const securityIcons = [<FaLock />, <FaShieldAlt />, <FaLock />, <FaShieldAlt />];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FaNewspaper className="text-cyan-400 text-3xl z-10 relative" />
                  <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-sm z-0"></div>
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  Cybersecurity News Feed
                </h2>
              </div>
              
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/70 border border-gray-700 rounded-lg py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <FaSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
              {[
                { id: 'all', label: 'All News' },
                { id: 'hacking', label: 'Hacking & Attacks' },
                { id: 'privacy', label: 'Privacy & Compliance' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-cyan-400/20 h-12 w-12"></div>
                </div>
                <p className="mt-4 text-gray-400">Decrypting the latest news...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-red-300 flex items-center gap-3">
                <FaLock className="text-red-500" />
                <div>
                  <h3 className="font-bold">Security Alert</h3>
                  <p>{error}</p>
                </div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
                <FaLock className="mx-auto text-4xl text-gray-600 mb-3" />
                <h3 className="text-xl font-semibold text-gray-300">No News Detected</h3>
                <p className="text-gray-500 mt-1">Your search didn't match any security bulletins</p>
              </div>
            ) : (
              <motion.ul 
                className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredArticles.map((article, i) => (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-gray-800/50 to-gray-900/70 border border-gray-700/50 p-4 rounded-xl hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                  >
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-700/30 mt-1">
                          {securityIcons[i % securityIcons.length]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1.5 text-gray-300 group-hover:text-cyan-400 transition-colors">
                            {article.title}
                            <span className="inline-block ml-2 text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded-full">
                              {article.source.name}
                            </span>
                          </h3>
                          {article.description && (
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-500 gap-3">
                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                              </svg>
                              {Math.ceil((article.title + article.description).length / 200)} min read
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {!loading && !error && filteredArticles.length > 0 && (
              <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <FaLock className="text-gray-600" />
                <span>Secure news feed updated {new Date().toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberNews;