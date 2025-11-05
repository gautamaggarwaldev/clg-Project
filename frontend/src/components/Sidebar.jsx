import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobileBreakpoint = 768;
      const isMobileNow = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobileNow);
      
      if (!isMobileNow) {
        setOpen(false);
      }
    };

    checkIfMobile();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkIfMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user from localStorage.");
      }
    }
  }, []);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const navItems = [
    { 
      label: "Profile", 
      path: "/app/profile", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    { 
      label: "Dashboard", 
      path: "/app/dashboard", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    { 
      label: "Security Tools", 
      path: "/app/tools", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    },
    { 
      label: "Cyber News", 
      path: "/app/cyber-news", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
    },
    { 
      label: "About Us", 
      path: "/app/about", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      label: "Contact Us", 
      path: "/app/contact", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <>
      {/* Floating Hamburger Button - Only on Mobile */}
      <AnimatePresence>
        {isMobile && !open && (
          <motion.button
            onClick={() => setOpen(true)}
            className="fixed top-6 left-6 z-[100] bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-xl hover:shadow-2xl md:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <AnimatePresence>
        {(open || !isMobile) && (
          <>
            {/* Overlay - Only on Mobile */}
            {isMobile && (
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            
            {/* Sidebar */}
            <motion.aside
              className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#0B1120] via-gray-900 to-[#0B1120] text-white flex flex-col shadow-2xl border-r border-gray-800/50 z-[95] md:z-10"
              initial={isMobile ? "closed" : false}
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30
              }}
            >
              {/* Header Section */}
              <div className="px-5 pt-6 pb-4 border-b border-gray-800/50">
                <div className="flex items-center justify-between mb-5">
                  <motion.div 
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      SecureApp
                    </span>
                  </motion.div>
                  
                  {isMobile && (
                    <motion.button
                      onClick={() => setOpen(false)}
                      className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors md:hidden"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* User Profile Card */}
                <motion.div 
                  className="relative bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-3.5 border border-gray-700/50 overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-3">
                    <motion.div
                      className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-base font-bold shadow-lg ring-2 ring-gray-700/50"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {initial}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {user?.name || "User"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        <span>Premium Member</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Section - No Scrollbar */}
              <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  nav::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="space-y-1.5">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        onHoverStart={() => setHoveredItem(index)}
                        onHoverEnd={() => setHoveredItem(null)}
                      >
                        <Link
                          to={item.path}
                          className={`relative flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-200 group ${
                            isActive
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                              : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
                          }`}
                          onClick={() => isMobile && setOpen(false)}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeBackground"
                              className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg"
                              initial={false}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <motion.span
                            className="relative z-10"
                            animate={{
                              scale: hoveredItem === index || isActive ? 1.15 : 1,
                              rotate: hoveredItem === index ? 12 : 0
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.icon}
                          </motion.span>
                          <span className="relative z-10 font-medium text-sm">
                            {item.label}
                          </span>
                          {isActive && (
                            <motion.div
                              className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full z-10"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Footer Section */}
              <div className="px-5 pb-5 pt-3 border-t border-gray-800/50 space-y-3">
                {/* Logout Button */}
                <motion.button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg bg-gray-800/30 hover:bg-red-900/20 text-gray-300 hover:text-red-400 transition-all duration-200 group border border-gray-700/50 hover:border-red-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium text-sm">Logout</span>
                </motion.button>

                {/* Copyright */}
                <motion.div 
                  className="text-center text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p>© {new Date().getFullYear()} SecureApp</p>
                  <p className="mt-0.5 text-gray-600">All rights reserved</p>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-center">
                Confirm Logout
              </h2>
              <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm leading-relaxed">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors font-medium text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors font-medium text-sm shadow-lg shadow-red-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;