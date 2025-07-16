import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ Load user info from localStorage
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

  // ✅ Get user initial
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  // ✅ Sidebar nav items
  const navItems = [
    { label: "Profile", path: "/app/profile" },
    { label: "Dashboard", path: "/app/dashboard" },
    { label: "Security Tools", path: "/app/tools" },
    { label: "Cyber News", path: "/app/cyber-news" },
    { label: "About Us", path: "/app/about" },
    { label: "Contact Us", path: "/app/contact" },
  ];

  // ✅ Logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* ✅ Hamburger Icon */}
      {!open && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button onClick={() => setOpen(true)} className="text-3xl text-white">
            &#9776;
          </button>
        </div>
      )}

      {/* ✅ Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-60 bg-[#1E293B] text-white z-40 p-6 transform transition-transform duration-300
        ${
          open ? "translate-x-0" : "translate-x-[-100%]"
        } md:translate-x-0 md:static md:block`}
      >
        {/* ❌ Close Button on Mobile */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <div className="text-lg font-bold">Menu</div>
          <button onClick={() => setOpen(false)} className="text-3xl">
            &times;
          </button>
        </div>

        {/* ✅ Profile Initial */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-500 text-white flex items-center justify-center rounded-full text-xl font-bold">
            {initial}
          </div>
          <span className="font-semibold text-lg hidden md:block">
            {user?.name || "User"}
          </span>
        </div>

        {/* ✅ Navigation */}
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-cyan-400 ${
                location.pathname === item.path ? "text-cyan-400" : ""
              }`}
              onClick={() => setOpen(false)} // Mobile close
            >
              {item.label}
            </Link>
          ))}

          {/* ✅ Logout trigger */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-6 text-left hover:text-red-400"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] text-white p-6 rounded-lg shadow-xl w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-500 px-4 py-1 rounded hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
