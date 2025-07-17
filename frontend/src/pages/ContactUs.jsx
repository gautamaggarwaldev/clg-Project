import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:5005/v1/contact/team', form);
      toast.success('Your message has been sent successfully!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again later.', {
        position: "top-center",
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-5">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-4xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/30"
          whileHover={{ 
            borderColor: "rgba(34, 211, 238, 0.3)",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.1)"
          }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Contact Us
              </span>
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">
              Have questions or need support? Send us a message and our team will get back to you shortly.
            </p>
          </motion.div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-xl bg-gray-700/50 border-gray-600 text-white shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm p-3"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-xl bg-gray-700/50 border-gray-600 text-white shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm p-3"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-xl bg-gray-700/50 border-gray-600 text-white shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm p-3"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                required
                className="mt-1 block w-full rounded-xl bg-gray-700/50 border-gray-600 text-white shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm p-3"
              ></textarea>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white ${isSubmitting ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
                whileHover={!isSubmitting ? { scale: 1.03 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Contact Info */}
          <motion.div 
            className="mt-16 pt-8 border-t border-gray-700/50 grid md:grid-cols-3 gap-6"
            variants={itemVariants}
          >
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Email</h3>
                <p className="text-white">support@cybershield.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Phone</h3>
                <p className="text-white">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Address</h3>
                <p className="text-white">RG Trade Tower, Netaji Subhash Place, Delhi – 110034</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ContactUs;