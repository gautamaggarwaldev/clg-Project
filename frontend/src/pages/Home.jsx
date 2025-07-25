import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Cpu,
  Activity,
  BarChart2,
  Server,
  Globe,
  Users,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const constraintsRef = useRef(null);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Threat Protection",
      desc: "Real-time defense against emerging cyber threats",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Data Encryption",
      desc: "Military-grade encryption for your sensitive data",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Dark Web Monitoring",
      desc: "24/7 surveillance of dark web for your credentials",
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "AI Security",
      desc: "Machine learning powered threat detection",
    },
  ];

  const rotatingTexts = [
    "Enterprise-Grade Cybersecurity For Everyone",
    "AI-Powered Threat Detection",
    "Protecting Your Digital Future",
    "Security Beyond Boundaries",
  ];

  const graphData = [
    {
      value: 99.9,
      label: "Threat Detection",
      color: "from-cyan-500 to-blue-500",
    },
    {
      value: 100,
      label: "Monitoring Coverage",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: 10,
      label: "Protected Assets (M+)",
      color: "from-purple-500 to-indigo-500",
    },
    {
      value: 50,
      label: "Security Experts",
      color: "from-amber-500 to-orange-500",
    },
  ];

  // Generate network nodes
  const networkNodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
  }));

  // Generate matrix characters
  const matrixChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const matrixColumns = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (i * 100) / 20,
    chars: Array.from(
      { length: 15 },
      () => matrixChars[Math.floor(Math.random() * matrixChars.length)]
    ),
    delay: Math.random() * 5,
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) =>
        prevIndex === rotatingTexts.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = animate(count, 100, { duration: 2 });
    return animation.stop;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative"
    >
      {/* Loading animation */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.8, duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 pointer-events-none"
        style={{ pointerEvents: "none" }}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.5, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full relative pointer-events-none"
        />
      </motion.div>

      {/* Enhanced Background Animations */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Radar Sweep Animation */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-cyan-500/20 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent rounded-full pointer-events-none"
            style={{
              clipPath: "polygon(50% 50%, 50% 0%, 60% 0%, 50% 50%)",
            }}
          />
        </motion.div>

        {/* Signal Wave Rings */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute top-1/2 right-1/4 w-64 h-64 border border-blue-500/20 rounded-full pointer-events-none"
            style={{
              transform: "translate(50%, -50%)",
            }}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Network Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {networkNodes.map((node, i) =>
            networkNodes.slice(i + 1).map((targetNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - targetNode.x, 2) +
                  Math.pow(node.y - targetNode.y, 2)
              );
              if (distance < 30) {
                return (
                  <motion.line
                    key={`line-${i}-${j}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    className="pointer-events-none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      pathLength: { duration: 2, delay: node.delay },
                      opacity: {
                        duration: 3,
                        repeat: Infinity,
                        delay: node.delay,
                      },
                    }}
                  />
                );
              }
              return null;
            })
          )}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
              <stop offset="50%" stopColor="rgba(6, 182, 212, 0.8)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Network Nodes */}
        {networkNodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute bg-cyan-500 rounded-full pointer-events-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                "0 0 5px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.8)",
                "0 0 5px rgba(6, 182, 212, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Matrix Rain Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {matrixColumns.map((column) => (
            <div
              key={column.id}
              className="absolute top-0 text-green-400 text-xs font-mono pointer-events-none"
              style={{ left: `${column.x}%` }}
            >
              {column.chars.map((char, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none"
                  animate={{
                    y: ["-100vh", "100vh"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    delay: column.delay + i * 0.1,
                    ease: "linear",
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Scanning Lines */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)",
              "linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)",
            ],
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)",
            height: "2px",
            top: "40%",
          }}
        />

        {/* Vertical Scanning Line */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(0deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)",
              "linear-gradient(0deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)",
            ],
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          style={{
            background:
              "linear-gradient(0deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)",
            width: "2px",
            left: "60%",
          }}
        />

        {/* Digital Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${
                Math.random() > 0.5 ? "6, 182, 212" : "34, 197, 94"
              }, 0.6)`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 200],
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Hexagonal Grid Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306B6D4' fill-opacity='0.1'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>

      <div className="relative" style={{ zIndex: 10 }}>
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-24 md:py-32">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div variants={item} className="flex justify-center mb-6">
              <motion.div
                className="px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 rounded-full text-cyan-400 text-sm flex items-center backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                PROTECTING DIGITAL ASSETS
              </motion.div>
            </motion.div>

            <div className="h-32 md:h-40 mb-6 overflow-hidden relative">
              {rotatingTexts.map((text, index) => (
                <motion.h1
                  key={index}
                  className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 leading-tight"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{
                    y: currentTextIndex === index ? 0 : -60,
                    opacity: currentTextIndex === index ? 1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 100,
                    mass: 0.5,
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
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
              Defend your digital presence with our AI-powered security
              platform. Get real-time threat detection, dark web monitoring, and
              enterprise-grade protection.
            </motion.p>

            {/* Fixed Navigation Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
              style={{ zIndex: 20 }}
            >
              <Link
                to="/register"
                className="relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer backdrop-blur-sm"
                style={{
                  zIndex: 30,
                  position: "relative",
                  pointerEvents: "auto",
                  display: "inline-block",
                }}
              >
                Get Protected Now
              </Link>

              <Link
                to="/login"
                className="relative px-8 py-4 bg-transparent border border-cyan-500/50 hover:bg-cyan-900/30 text-cyan-400 rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer backdrop-blur-sm"
                style={{
                  zIndex: 30,
                  position: "relative",
                  pointerEvents: "auto",
                  display: "inline-block",
                }}
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
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            ref={constraintsRef}
            style={{ zIndex: 15 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all relative overflow-hidden"
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow:
                    "0 20px 25px -5px rgba(6, 182, 212, 0.1), 0 10px 10px -5px rgba(6, 182, 212, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.1}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 pointer-events-none"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-400 relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Security Badges with Graphs */}
        <motion.div
          className="py-16 bg-gray-800/30 border-t border-b border-gray-700/50 relative overflow-hidden backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ zIndex: 5 }}
        >
          <motion.div
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.15 }}
              viewport={{ once: true }}
            >
              {graphData.map((data, index) => (
                <motion.div
                  key={index}
                  className="text-center w-40"
                  variants={item}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative h-40 mb-4">
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${data.color} rounded-t-lg`}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${data.value}%` }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.15,
                        type: "spring",
                        damping: 10,
                      }}
                      viewport={{ once: true }}
                      style={{ originY: 1 }}
                    />
                    <div className="absolute top-0 left-0 right-0 text-white text-2xl font-bold flex items-center justify-center h-full">
                      <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: index * 0.15 + 1 }}
                        viewport={{ once: true }}
                      >
                        {data.value}
                        {data.label.includes("%")
                          ? ""
                          : data.label.includes("(M+)")
                          ? ""
                          : "%"}
                      </motion.span>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.8 }}
                    viewport={{ once: true }}
                    className="text-gray-400"
                  >
                    {data.label}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional animated statistics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                staggerChildren: 0.1,
                delayChildren: 0.5,
              }}
              viewport={{ once: true }}
            >
              {[
                {
                  icon: <Server className="w-8 h-8 text-cyan-500 mr-3" />,
                  value: "250+",
                  label: "Servers Protected",
                  color: "cyan",
                },
                {
                  icon: <Globe className="w-8 h-8 text-green-500 mr-3" />,
                  value: "40+",
                  label: "Countries Covered",
                  color: "green",
                },
                {
                  icon: <Users className="w-8 h-8 text-purple-500 mr-3" />,
                  value: "15K+",
                  label: "Happy Clients",
                  color: "purple",
                },
                {
                  icon: <BarChart2 className="w-8 h-8 text-amber-500 mr-3" />,
                  value: "99.99%",
                  label: "Uptime Guarantee",
                  color: "amber",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:shadow-lg transition-all backdrop-blur-sm"
                  variants={item}
                  whileHover={{
                    y: -5,
                    borderColor: `var(--${stat.color}-500)`,
                    boxShadow: `0 10px 15px -3px rgba(var(--${stat.color}-500), 0.1)`,
                  }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {stat.icon}
                    </motion.div>
                    <motion.span
                      className="text-xl font-semibold text-white"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      viewport={{ once: true }}
                    >
                      {stat.value}
                    </motion.span>
                  </div>
                  <motion.p
                    className="text-gray-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                    viewport={{ once: true }}
                  >
                    {stat.label}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Animated testimonials section */}
        <motion.div
          className="py-24 container mx-auto px-6 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="absolute -top-20 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.h2
            className="text-3xl font-bold text-center text-white mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Trusted By Security Experts
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            viewport={{ once: true }}
          >
            {[
              {
                quote:
                  "The most comprehensive security solution we've implemented. Reduced our threats by 95%.",
                author: "Sarah Johnson",
                role: "CTO, TechCorp",
              },
              {
                quote:
                  "Their AI detection caught vulnerabilities our team missed. Game-changing protection.",
                author: "Michael Chen",
                role: "Security Director, FinSecure",
              },
              {
                quote:
                  "24/7 monitoring gives us peace of mind. The dashboards are incredibly insightful.",
                author: "Emma Rodriguez",
                role: "IT Manager, HealthPlus",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 relative overflow-hidden"
                variants={item}
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 20px 25px -5px rgba(6, 182, 212, 0.1), 0 10px 10px -5px rgba(6, 182, 212, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 blur-md transition-opacity duration-300 pointer-events-none"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative z-10">
                  <motion.div
                    className="text-gray-300 mb-6 text-lg leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    "{testimonial.quote}"
                  </motion.div>
                  <motion.div
                    className="border-t border-gray-700/50 pt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-cyan-400 font-medium">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {testimonial.role}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
