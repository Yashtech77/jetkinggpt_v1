// App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import Dashboard from "./pages/Dashboard";
import UploadExcel from "./pages/UploadExcel";

function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f3f4f6] flex">
        {/* ✅ Sidebar already reacts to assistantOpen */}
        <Sidebar assistantOpen={isAssistantOpen} />

        {/* Main Pages */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  isAssistantOpen={isAssistantOpen}
                  setIsAssistantOpen={setIsAssistantOpen}
                />
              }
            />

            {/* ✅ Pass the same props here */}
            <Route
              path="/upload-excel"
              element={
                <UploadExcel
                  isAssistantOpen={isAssistantOpen}
                  setIsAssistantOpen={setIsAssistantOpen}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
