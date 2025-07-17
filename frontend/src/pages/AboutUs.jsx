import React from "react";
import { Mail, ShieldCheck, Globe, Cpu, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const AboutUs = () => {
  const currentYear = new Date().getFullYear();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hover: {
      y: -8,
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-12 text-gray-100"
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Title with animated gradient */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center mb-2">
            <Sparkles className="text-cyan-400 mr-2" />
            <span className="text-sm font-medium text-cyan-400">CYBERSECURE AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              About Us
            </span>
          </h1>
          <motion.div 
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          />
        </motion.div>

        {/* Website Intro */}
        <motion.section 
          className="mb-16 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-lg md:text-xl leading-relaxed text-gray-300">
            Welcome to <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CyberSecure AI</span> – your advanced cybersecurity solution. We combine cutting-edge AI with real-time monitoring to protect your digital assets across URLs, IPs, and domains.
          </p>
        </motion.section>

        {/* Features */}
        <motion.section 
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Real-Time Threat Detection"
            desc="Advanced AI scanning for URLs, IPs, and domains with instant threat detection."
            variants={featureVariants}
            custom={0}
            gradient="from-purple-600 to-blue-600"
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Dark Web Monitoring"
            desc="Continuous surveillance of dark web channels for your sensitive data."
            variants={featureVariants}
            custom={1}
            gradient="from-cyan-600 to-emerald-600"
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6" />}
            title="AI-Powered Insights"
            desc="Machine learning analysis with actionable security recommendations."
            variants={featureVariants}
            custom={2}
            gradient="from-blue-600 to-indigo-600"
          />
          <FeatureCard
            icon={<Download className="w-6 h-6" />}
            title="Comprehensive Reports"
            desc="Export detailed security reports in multiple formats with one click."
            variants={featureVariants}
            custom={3}
            gradient="from-violet-600 to-purple-600"
          />
        </motion.section>

        {/* Company Description */}
        <motion.section 
          className="mb-16 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          whileHover={{ 
            borderColor: "rgba(34, 211, 238, 0.3)",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.1)"
          }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Our Mission
            </span>
          </h2>
          <p className="text-base leading-relaxed text-gray-300">
            At CyberSecure AI, we're redefining cybersecurity through innovation. Based in Delhi, our team of experts builds intelligent systems that anticipate threats before they happen. We believe in making enterprise-grade protection accessible to businesses of all sizes through our intuitive platform.
          </p>
        </motion.section>

        {/* Owner Info */}
        <motion.section 
          className="mb-16 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          whileHover={{ 
            borderColor: "rgba(96, 165, 250, 0.3)",
            boxShadow: "0 0 30px rgba(96, 165, 250, 0.1)"
          }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              The Visionary
            </span>
          </h2>
          <p className="text-base leading-relaxed text-gray-300 mb-6">
            Created by <span className="font-medium text-cyan-400">GG</span>, a cybersecurity visionary with a passion for building transformative digital security solutions. GG combines technical expertise with a user-first philosophy to create tools that are both powerful and accessible.
          </p>
          <motion.a
            href="mailto:gghelp@gmail.com"
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact GG
          </motion.a>
        </motion.section>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-gray-400 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="mb-2 flex justify-center">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          </div>
          © {currentYear} CyberSecure AI. All rights reserved.
          <div className="mt-2 text-xs text-gray-500">
            Protecting your digital universe
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ icon, title, desc, variants, custom, gradient }) => (
  <motion.div 
    className={`bg-gradient-to-br ${gradient} p-0.5 rounded-xl shadow-lg`}
    variants={variants}
    custom={custom}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    whileTap="tap"
    transition={{ delay: custom * 0.1 }}
  >
    <div className="bg-gray-900/90 h-full p-6 rounded-[11px] backdrop-blur-sm">
      <motion.div 
        className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${gradient} mb-4`}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm text-gray-300">{desc}</p>
    </div>
  </motion.div>
);

export default AboutUs;