import React, { useState, useCallback } from 'react';
import { Copy, Check, Key, RefreshCw } from 'lucide-react';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState('');
  const [strengthColor, setStrengthColor] = useState('');
  
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  const calculateStrength = (pass) => {
    if (!pass) return { text: '', color: '' };
    
    let score = 0;
    if (pass.length >= 12) score += 2;
    if (pass.length >= 16) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 2;

    if (score >= 7) return { text: 'Very Strong', color: 'bg-green-500' };
    if (score >= 5) return { text: 'Strong', color: 'bg-blue-500' };
    if (score >= 3) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Weak', color: 'bg-red-500' };
  };

  const generatePassword = useCallback(() => {
    const selectedSets = Object.keys(options)
      .filter(key => options[key])
      .map(key => characterSets[key]);

    if (selectedSets.length === 0) {
      alert('Please select at least one character type');
      return;
    }

    let charset = selectedSets.join('');
    let newPassword = '';

    selectedSets.forEach(set => {
      newPassword += set[Math.floor(Math.random() * set.length)];
    });

    for (let i = newPassword.length; i < length; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
    const strengthInfo = calculateStrength(newPassword);
    setStrength(strengthInfo.text);
    setStrengthColor(strengthInfo.color);
  }, [options, length]);

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password: ', err);
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600`}>
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Password Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate strong, random passwords with customizable character sets
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          {/* Password Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-300">
                Generated Password
              </label>
              {password && (
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${strengthColor} text-white`}>
                  {strength}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-700 rounded-xl p-4 border border-gray-600">
                <div className="text-white font-mono text-lg tracking-wider break-all min-h-[2rem]">
                  {password || 'Click generate to create a password...'}
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!password}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[3.5rem]"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Length Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-300">
                Password Length: <span className="text-blue-400">{length}</span>
              </label>
              <span className="text-xs text-gray-500">4-32 characters</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Character Options */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-gray-300 mb-4 block">
              Character Types
            </label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleOptionChange(key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    value
                      ? 'bg-blue-900/30 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20'
                      : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold capitalize text-left">
                    {key === 'uppercase' && 'ABCD Uppercase'}
                    {key === 'lowercase' && 'abcd Lowercase'}
                    {key === 'numbers' && '123 Numbers'}
                    {key === 'symbols' && '!@# Symbols'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl border border-blue-500/30"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Secure Password
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Passwords are generated locally in your browser and never stored or transmitted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;