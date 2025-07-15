import { useState } from 'react';

const InputField = ({ label, type, name, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-4">
      {label && <label className="block mb-1 text-sm text-white font-semibold">{label}</label>}

      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        {/* 👁️ Show/Hide Password Icon */}
        {isPassword && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer select-none"
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;
