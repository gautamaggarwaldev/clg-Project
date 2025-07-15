import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <div className="text-center p-8 bg-[#1E293B] rounded-xl shadow-2xl max-w-xl w-full">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">Welcome to CyberSecure</h1>
        <p className="mb-6 text-gray-300">
          Protect your digital assets with our cutting-edge cyber security tools. Register now or login to access the dashboard.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/login"
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-800 rounded-lg transition duration-200"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
