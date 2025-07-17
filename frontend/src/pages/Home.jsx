import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Cpu, Activity, BarChart2, Server, Globe, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const Home = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const features = [
    { icon: <Shield className="w-8 h-8" />, title: "Threat Protection", desc: "Real-time defense against emerging cyber threats" },
    { icon: <Lock className="w-8 h-8" />, title: "Data Encryption", desc: "Military-grade encryption for your sensitive data" },
    { icon: <Eye className="w-8 h-8" />, title: "Dark Web Monitoring", desc: "24/7 surveillance of dark web for your credentials" },
    { icon: <Cpu className="w-8 h-8" />, title: "AI Security", desc: "Machine learning powered threat detection" },
  ];

  // Rotating text for dynamic headline
  const rotatingTexts = [
    "Enterprise-Grade Cybersecurity For Everyone",
    "AI-Powered Threat Detection",
    "Protecting Your Digital Future",
    "Security Beyond Boundaries"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        prevIndex === rotatingTexts.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Graph data for the statistics
  const graphData = [
    { value: 99.9, label: "Threat Detection", color: "from-cyan-500 to-blue-500" },
    { value: 100, label: "Monitoring Coverage", color: "from-green-500 to-emerald-500" },
    { value: 10, label: "Protected Assets (M+)", color: "from-purple-500 to-indigo-500" },
    { value: 50, label: "Security Experts", color: "from-amber-500 to-orange-500" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative"
    >
      {/* Loading animation overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Binary code animation */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-24 md:py-32">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div variants={item} className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 rounded-full text-cyan-400 text-sm flex items-center">
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                PROTECTING DIGITAL ASSETS
              </div>
            </motion.div>

            <div className="h-32 md:h-40 mb-6 overflow-hidden">
              {rotatingTexts.map((text, index) => (
                <motion.h1
                  key={index}
                  className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 leading-tight"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ 
                    y: currentTextIndex === index ? 0 : -50,
                    opacity: currentTextIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  {text}
                </motion.h1>
              ))}
            </div>

            <motion.p 
              variants={item}
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
            >
              Defend your digital presence with our AI-powered security platform. Get real-time threat detection, dark web monitoring, and enterprise-grade protection.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Get Protected Now
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border border-cyan-500/50 hover:bg-cyan-900/30 text-cyan-400 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Existing User? Login
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Security Badges with Graphs */}
        <motion.div 
          className="py-12 bg-gray-800/30 border-t border-b border-gray-700/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {graphData.map((data, index) => (
                <motion.div 
                  key={index}
                  className="text-center w-40"
                  variants={item}
                >
                  <div className="relative h-40 mb-4">
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${data.color} rounded-t-lg`}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${data.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      style={{ originY: 1 }}
                    />
                    <div className="absolute top-0 left-0 right-0 text-white text-2xl font-bold flex items-center justify-center h-full">
                      {data.value}{data.label.includes('%') ? '' : data.label.includes('(M+)') ? '' : '%'}
                    </div>
                  </div>
                  <div className="text-gray-400">{data.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional animated statistics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <Server className="w-8 h-8 text-cyan-500 mr-3" />
                  <span className="text-xl font-semibold text-white">250+</span>
                </div>
                <p className="text-gray-400">Servers Protected</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-green-500 mr-3" />
                  <span className="text-xl font-semibold text-white">40+</span>
                </div>
                <p className="text-gray-400">Countries Covered</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-purple-500 mr-3" />
                  <span className="text-xl font-semibold text-white">15K+</span>
                </div>
                <p className="text-gray-400">Happy Clients</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <BarChart2 className="w-8 h-8 text-amber-500 mr-3" />
                  <span className="text-xl font-semibold text-white">99.99%</span>
                </div>
                <p className="text-gray-400">Uptime Guarantee</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated testimonials section */}
        <motion.div 
          className="py-16 container mx-auto px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">Trusted By Security Experts</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "The most comprehensive security solution we've implemented. Reduced our threats by 95%.",
                author: "Sarah Johnson",
                role: "CTO, TechCorp"
              },
              {
                quote: "Their AI detection caught vulnerabilities our team missed. Game-changing protection.",
                author: "Michael Chen",
                role: "Security Director, FinSecure"
              },
              {
                quote: "24/7 monitoring gives us peace of mind. The dashboards are incredibly insightful.",
                author: "Emma Rodriguez",
                role: "IT Manager, HealthPlus"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-gray-300 mb-4">{testimonial.quote}</div>
                <div className="text-cyan-400 font-medium">{testimonial.author}</div>
                <div className="text-gray-500 text-sm">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;