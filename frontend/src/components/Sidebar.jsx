import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load user from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user from localStorage.");
      }
    }
  }, []);

  // ✅ Safely get first letter of user's name
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  const navItems = [
    { label: 'Profile', path: '/app/profile' },
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'About Us', path: '/app/about' },
    { label: 'Contact Us', path: '/app/contact' },
  ];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* ✅ Hamburger Icon (only shown when sidebar is closed on mobile) */}
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
        ${open ? 'translate-x-0' : 'translate-x-[-100%]'} md:translate-x-0 md:static md:block`}
      >
        {/* ❌ Close Button (Mobile Only) */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <div className="text-lg font-bold">Menu</div>
          <button onClick={() => setOpen(false)} className="text-3xl">&times;</button>
        </div>

        {/* ✅ Profile Initial */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-500 text-white flex items-center justify-center rounded-full text-xl font-bold">
            {initial}
          </div>
          <span className="font-semibold text-lg hidden md:block">{user?.name || 'User'}</span>
        </div>

        {/* ✅ Navigation Links */}
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-cyan-400 ${location.pathname === item.path ? 'text-cyan-400' : ''}`}
              onClick={() => setOpen(false)} // Close sidebar on mobile
            >
              {item.label}
            </Link>
          ))}
          <button onClick={logout} className="mt-6 text-left hover:text-red-400">Logout</button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
