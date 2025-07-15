import { useState } from 'react';
import { registerUser } from '../api/auth';
import InputField from '../components/InputField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', profession: '', organization: ''
  });
  const [errors, setErrors] = useState({});

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

    try {
      await registerUser(formData);
      toast.success('Registration Successful!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
      toast.error(`❌ ${msg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Register on CyberSecure</h2>

        {['name', 'email', 'password', 'phone', 'profession', 'organization'].map((field) => (
          <div key={field}>
            <InputField
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              type={field === 'password' ? 'password' : 'text'}
              placeholder={`Enter your ${field}`}
            />
            {errors[field] && <p className="text-red-400 text-sm mb-2">{errors[field]}</p>}
          </div>
        ))}

        <button type="submit" className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition duration-200">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
