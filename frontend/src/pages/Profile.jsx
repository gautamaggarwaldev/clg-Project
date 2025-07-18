import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Building, Edit, Save, X, Loader2, Shield } from 'lucide-react';

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
      // await axios.put('http://localhost:5005/v1/user/update-profile', form, {
      await axios.put('https://cs-qhmx.onrender.com/v1/user/update-profile', form, {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center"
        >
          <Shield className="w-12 h-12 text-cyan-400 mb-4" />
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto py-10 px-4"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block p-3 bg-white/20 rounded-full mb-4"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-cyan-100">Manage your account information</p>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {['name', 'email', 'phone', 'profession', 'organization'].map((field) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * ['name', 'email', 'phone', 'profession', 'organization'].indexOf(field) }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  {fieldIcons[field]}
                  <label className="font-medium capitalize">{field}</label>
                </div>
                {editing ? (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={form[field] || ''}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-200">
                    {user[field] || <span className="text-gray-500">Not provided</span>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <AnimatePresence mode="wait">
              {!editing ? (
                <motion.button
                  key="edit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-5 py-2 rounded-lg text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    key="save"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-white transition-colors"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button
                    key="cancel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;