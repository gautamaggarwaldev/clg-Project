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

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setOpen(true); // Always show on desktop
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Load user info from localStorage
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

  // Get user initial
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  // Sidebar nav items with icons
  const navItems = [
    { label: "Profile", path: "/app/profile", icon: "👤" },
    { label: "Dashboard", path: "/app/dashboard", icon: "📊" },
    { label: "Security Tools", path: "/app/tools", icon: "🛡️" },
    { label: "Cyber News", path: "/app/cyber-news", icon: "📰" },
    { label: "About Us", path: "/app/about", icon: "🏢" },
    { label: "Contact Us", path: "/app/contact", icon: "✉️" },
  ];

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  const hoverEffect = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  const tapEffect = {
    scale: 0.95
  };

  return (
    <>
      {/* Floating Hamburger Button - Only shown on mobile when sidebar is closed */}
      {isMobile && !open && (
        <motion.button
          onClick={() => setOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
      )}

      {/* Sidebar - Always visible on desktop, conditionally on mobile */}
      <AnimatePresence>
        {(!isMobile || open) && (
          <>
            {/* Overlay for mobile */}
            {isMobile && open && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            <motion.div
              className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white z-40 p-6 shadow-2xl`}
              initial={isMobile ? "closed" : "open"}
              animate="open"
              exit={isMobile ? "closed" : "open"}
              variants={sidebarVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close Button on Mobile */}
              {isMobile && (
                <div className="flex justify-between items-center mb-8">
                  <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Navigation
                  </div>
                  <motion.button
                    onClick={() => setOpen(false)}
                    className="text-2xl hover:text-cyan-400"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    &times;
                  </motion.button>
                </div>
              )}

              {/* User Profile */}
              <motion.div 
                className="mb-8 flex items-center gap-4 p-3 bg-gray-700 bg-opacity-50 rounded-xl"
                whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.7)" }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold shadow-md"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {initial}
                </motion.div>
                <div>
                  <div className="font-semibold text-lg">{user?.name || "User"}</div>
                  <div className="text-sm text-gray-300">Premium Member</div>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    onHoverStart={() => setHoveredItem(index)}
                    onHoverEnd={() => setHoveredItem(null)}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md"
                          : "hover:bg-gray-700"
                      }`}
                      onClick={() => isMobile && setOpen(false)}
                    >
                      <motion.span
                        animate={{
                          scale: hoveredItem === index ? 1.2 : 1
                        }}
                        className="text-lg"
                      >
                        {item.icon}
                      </motion.span>
                      <span className="font-medium">{item.label}</span>
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="activeItem"
                          className="absolute right-4 w-2 h-2 bg-white rounded-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Logout Button */}
                <motion.button
                  onClick={() => setShowLogoutModal(true)}
                  className="mt-6 flex items-center gap-3 p-3 text-left rounded-lg hover:bg-red-900 hover:bg-opacity-50 transition-all group"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-lg group-hover:animate-pulse">🚪</span>
                  <span className="font-medium">Logout</span>
                </motion.button>
              </nav>

              {/* Footer */}
              <motion.div 
                className="absolute bottom-4 left-0 right-0 px-6 text-center text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                © {new Date().getFullYear()} Security App
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-2xl w-[90%] max-w-sm border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-center">
                Ready to leave?
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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