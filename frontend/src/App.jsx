import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layout/DashboardLayout";
import Profile from "./pages/Profile";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Tools from "./pages/Tools";
import ScanURL from "./pages/ScanURL";
import DomainCheck from "./pages/DomainCheck";
import IpCheck from "./pages/IpCheck";
import FileUploadScan from "./pages/FileUploadScan";
import HashReport from "./pages/HashReport";
import AiChat from "./pages/AiChat";
import CyberNews from "./pages/CyberNews";
import DarkWebScanner from "./pages/DarkWebScanner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordDesign from "./pages/PasswordDesign";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app/tools/scan-url"
          element={
            <PrivateRoute>
              <ScanURL />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/tools/domain-check"
          element={
            <PrivateRoute>
              <DomainCheck />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/tools/ip-scan"
          element={
            <PrivateRoute>
              <IpCheck />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/tools/file-upload"
          element={
            <PrivateRoute>
              <FileUploadScan />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/tools/hash-report"
          element={
            <PrivateRoute>
              <HashReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/tools/ai-chat"
          element={
            <PrivateRoute>
              <AiChat />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/cyber-news"
          element={
            <PrivateRoute>
              <CyberNews />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/dark-web-scanner"
          element={
            <PrivateRoute>
              <DarkWebScanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/password-generator"
          element={
            <PrivateRoute>
              <PasswordDesign />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tools" element={<Tools />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
