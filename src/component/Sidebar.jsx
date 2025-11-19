import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  ChevronLeft,
  ChevronRight,
  Bot, // Imported BotMessageSquare
} from "lucide-react";

const Sidebar = ({ assistantOpen }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 🔴 Auto-collapse when the AI assistant panel is opened
  useEffect(() => {
    if (assistantOpen) {
      setCollapsed(true);
    }
  }, [assistantOpen]);

  const isActive = (path) =>
    pathname === path
      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
      : "text-slate-700 hover:bg-slate-100";

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Upload Excel",
      path: "/upload-excel",
      icon: <Upload className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Logo + Collapse Button */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center text-white font-semibold shadow-sm">
            <Bot className="w-6 h-6" /> {/* Replaced with BotMessageSquare icon */}
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm leading-tight text-slate-900">
              Jetking GPT
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-3 flex-1">
        <ul className="px-2 space-y-1.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(
                  item.path
                )}`}
              >
                <span
                  className={`flex items-center justify-center ${
                    collapsed ? "w-full" : "mr-3"
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
