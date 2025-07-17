import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

const InputField = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  hasError = false,
  icon: IconComponent 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <motion.div
        animate={{
          borderColor: hasError 
            ? '#f87171' 
            : isFocused 
              ? '#06b6d4' 
              : '#374151',
          backgroundColor: isFocused ? '#1f2937' : '#111827'
        }}
        className="relative flex items-center rounded-lg border px-3 py-2 shadow-sm transition-colors"
      >
        {IconComponent && (
          <div className="mr-3 text-gray-400">
            <IconComponent className="h-5 w-5" />
          </div>
        )}

        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="block w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
        />

        {/* Password toggle button */}
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </motion.button>
        )}

        {/* Error indicator */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -right-2 -top-2"
            >
              <div className="rounded-full bg-red-500 p-1">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InputField;