import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Building, Edit, Save, X, Loader2, Shield, Lock, Activity, CheckCircle } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const fieldIcons = {
    name: <User className="w-5 h-5 text-cyan-400" />,
    email: <Mail className="w-5 h-5 text-cyan-400" />,
    phone: <Phone className="w-5 h-5 text-cyan-400" />,
    profession: <Briefcase className="w-5 h-5 text-cyan-400" />,
    organization: <Building className="w-5 h-5 text-cyan-400" />
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        // const res = await axios.get('http://localhost:5005/v1/user/profile', {
        const res = await axios.get('https://cs-qhmx.onrender.com/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setForm(res.data.user);
        setLoading(false);
      } catch {
        toast.error('Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put('http://localhost:5005/v1/user/update-profile', form, {
      // await axios.put('https://cs-qhmx.onrender.com/v1/user/update-profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Profile updated successfully');
      localStorage.setItem('user', JSON.stringify(form));
      setUser(form);
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-cyan-500/30 border-t-cyan-500"
          />
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-full p-8 border border-cyan-500/20">
            <Shield className="w-16 h-16 text-cyan-400" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Security Profile</h1>
          </div>
          <p className="text-gray-400 ml-11">Manage your account credentials and personal information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden">
              {/* Profile Avatar Section */}
              <div className="relative h-32 bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMnYxMmgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <User className="w-16 h-16 text-cyan-400" />
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900 flex items-center justify-center"
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{user?.name || 'User'}</h2>
                <p className="text-cyan-400 text-sm mb-4">{user?.profession || 'Professional'}</p>
                
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                  <Building className="w-4 h-4" />
                  <span>{user?.organization || 'Organization'}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <p className="text-2xl font-bold text-white">100%</p>
                    </div>
                    <p className="text-xs text-gray-400">Security</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="w-4 h-4 text-green-400" />
                      <p className="text-2xl font-bold text-white">Active</p>
                    </div>
                    <p className="text-xs text-gray-400">Status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold">Account Security</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">Your account is protected with advanced encryption and security measures.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>2FA Enabled</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Profile Information</h2>
                    <p className="text-sm text-gray-400">View and update your personal details</p>
                  </div>
                  <AnimatePresence mode="wait">
                    {!editing ? (
                      <motion.button
                        key="edit-btn"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Edit className="w-5 h-5" />
                        Edit Profile
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['name', 'email', 'phone', 'profession', 'organization'].map((field, idx) => (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className={field === 'email' ? 'md:col-span-2' : ''}
                    >
                      <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
                        <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                          {fieldIcons[field]}
                        </div>
                        <span className="capitalize">{field}</span>
                      </label>
                      {editing ? (
                        <motion.input
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          type={field === 'email' ? 'email' : 'text'}
                          name={field}
                          value={form[field] || ''}
                          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder={`Enter your ${field}`}
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 min-h-[48px] flex items-center">
                          {user[field] || <span className="text-gray-500 italic">Not provided</span>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <AnimatePresence mode="wait">
                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-700"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-8 py-3 rounded-xl text-white font-medium transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditing(false);
                          setForm(user);
                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-xl text-white font-medium transition-all"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Additional Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold">Email Verified</h3>
                </div>
                <p className="text-sm text-gray-400">Your email address has been verified and is secure.</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold">Account Active</h3>
                </div>
                <p className="text-sm text-gray-400">Your account is active and in good standing.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;