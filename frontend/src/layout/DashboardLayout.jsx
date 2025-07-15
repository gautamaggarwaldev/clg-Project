import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#0B1120] text-white">
      <Sidebar />
      <main className="flex-1 p-6 mt-4 md:ml-60">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
