import { useState } from 'react';
import { registerUser } from '../api/auth';
import InputField from '../components/InputField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Briefcase, Building, ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', profession: '', organization: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldIcons = {
    name: <User className="w-5 h-5 text-gray-400" />,
    email: <Mail className="w-5 h-5 text-gray-400" />,
    password: <Lock className="w-5 h-5 text-gray-400" />,
    phone: <Phone className="w-5 h-5 text-gray-400" />,
    profession: <Briefcase className="w-5 h-5 text-gray-400" />,
    organization: <Building className="w-5 h-5 text-gray-400" />
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) newErrors[key] = 'This field is required';
    });
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await registerUser(formData);
      toast.success('Registration Successful!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-700"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Create Account
        </motion.h2>
        <p className="text-gray-400 text-center mb-8">Join our security community</p>

        <div className="space-y-4">
          {['name', 'email', 'password', 'phone', 'profession', 'organization'].map((field, index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                {fieldIcons[field]}
                <label className="text-sm text-gray-300">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
              <InputField
                name={field}
                value={formData[field]}
                onChange={handleChange}
                type={field === 'password' ? 'password' : 'text'}
                placeholder={`Enter your ${field}`}
                hasError={!!errors[field]}
              />
              {errors[field] && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors[field]}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
            isSubmitting 
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Registering...
            </span>
          ) : (
            'Register Now'
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-gray-400"
        >
          Already have an account?{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate('/login')}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Sign In
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default Register;