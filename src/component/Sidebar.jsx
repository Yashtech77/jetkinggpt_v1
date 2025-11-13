import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const isActive = (path) =>
    pathname === path
      ? "bg-[#c7243b] text-white shadow-sm"
      : "text-black hover:bg-black/10";

  return (
    <aside className="h-screen w-60 bg-[#ffffff] text-black flex flex-col sticky top-0">
      {/* Logo */}
       <div className="flex items-center px-6 py-4 border-b border-black/10">
          <img src="https://myai-aws-bucket.s3.ap-south-1.amazonaws.com/Jetking_Logo.png" alt="Logo" className="h-10 mr-2" />
          <span className="font-bold text-lg">GPT</span>
        </div>

      <nav className="mt-4 flex-1">
        <ul className="px-3 space-y-2">

          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg ${isActive(
                "/dashboard"
              )}`}
            >
              <span>📊</span> <span>Dashboard</span>
            </Link>
          </li>

          {/* Upload Excel */}
          <li>
            <Link
              to="/upload-excel"
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg ${isActive(
                "/upload-excel"
              )}`}
            >
              <span>📂</span> <span className="text-black">Upload Excel</span>
            </Link>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
