import { useState } from 'react';
import { loginUser } from '../api/auth';
import InputField from '../components/InputField';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'This field is required';
    if (!formData.password) newErrors.password = 'This field is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await loginUser(formData); // Call your backend

      // ✅ Store token and user (if user info is included in res.data)
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      toast.success('✅ Login Successful!');
      setTimeout(() => navigate('/app/profile'), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      toast.error(`❌ ${msg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Login to CyberSecure</h2>

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-red-400 text-sm mb-2">{errors.email}</p>}

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
        {errors.password && <p className="text-red-400 text-sm mb-2">{errors.password}</p>}

        <button
          type="submit"
          className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;