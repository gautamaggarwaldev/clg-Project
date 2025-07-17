import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Cpu, Activity } from 'lucide-react';

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative"
    >
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

            <motion.h1 
              variants={item}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 leading-tight"
            >
              Enterprise-Grade Cybersecurity <br />For Everyone
            </motion.h1>

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

        {/* Security Badges */}
        <motion.div 
          className="py-12 bg-gray-800/30 border-t border-b border-gray-700/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Threat Detection Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400">Security Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10M+</div>
                <div className="text-gray-400">Protected Assets</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-400">Security Experts</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;