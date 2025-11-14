import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(true); // Modal visible by default
  const [fileUploaded, setFileUploaded] = useState(false); // Track if file is uploaded
  const [activeTab, setActiveTab] = useState("analytics");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = () => {
    if (!file) return alert("Please select a file first");
    
    // Simulate upload (replace with actual API call)
    alert("File uploaded successfully!");
    setFileUploaded(true);
    setShowModal(false); // Close modal after upload
  };

 const handleCloseModal = () => {
  setShowModal(false);
  navigate("/dashboard");
};
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      if (!API_BASE_URL) {
        setAnswer("Set VITE_API_BASE_URL in your .env file to connect the backend.");
      } else {
        const res = await fetch(`${API_BASE_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        const data = await res.json();
        setAnswer(data.answer || "No answer received from API.");
      }
    } catch (err) {
      console.error(err);
      setAnswer("Something went wrong while asking the question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:rotate-90 group"
            >
              <span className="text-gray-600 group-hover:text-gray-900 text-2xl font-light">×</span>
            </button>

            {/* Modal Content */}
            <div className="p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-4 border-2 border-blue-200">
                  <span className="text-5xl">☁️</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Excel File</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Choose an Excel file containing student and fee data to unlock AI-powered insights
                </p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-[#c7243b] hover:bg-gray-50/50 transition-all duration-300 group mb-6">
                <input
                  type="file"
                  className="hidden"
                  id="excelInput"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <label
                  htmlFor="excelInput"
                  className="px-8 py-3 bg-gradient-to-r from-[#c7243b] to-[#a81c30] text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                >
                  📁 Choose File
                </label>

                {file && (
                  <div className="mt-4 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
                    <span className="text-green-600">✓</span>
                    <p className="text-sm text-green-700 font-medium">{file.name}</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    className="px-10 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    ⬆️ Upload & Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only visible after file upload or modal close */}
      {!showModal && (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="w-full">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Data Management</h2>
            <p className="text-xs text-gray-600 mt-0.9">
              {fileUploaded ? `Analyzing: ${file?.name || 'your file'}` : 'Upload Excel files and explore analytics'}
            </p>
          </div>

          {/* Header with Toggle */}
          <header className="flex flex-col items-center gap-4">
            {/* Toggle Button */}
            <div className="relative flex w-full md:w-auto rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-0.9 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            {[
                { id: "analytics", label: "📊 Analytics" },
                { id: "assistant", label: "🤖 Ask AI" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-7 py-2.7 text-xs font-semibold rounded-xl transition-all duration-500 ease-out ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#c7243b] to-[#a81c30] text-white shadow-lg shadow-[#c7243b]/30 scale-100 transform"
                      : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:scale-102"
                  }`}
                >
                  <span className={`relative z-10 transition-all duration-500 ${
                    activeTab === tab.id ? "tracking-wide" : ""
                  }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </header>

          {/* CONTENT AREA */}
          {activeTab === "analytics" ? (
            /* ---------- ANALYTICS VIEW ---------- */
            <section className="space-y-6">
              {/* Demo Graphs Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Student Distribution Graph */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Student Distribution</h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Demo Data
                    </span>
                  </div>

                  <div className="flex items-end justify-around h-48 mt-6">
                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="relative">
                        <div className="w-16 rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 h-32 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-blue-300" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                          120 Students
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">2023</span>
                      <span className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">120</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="relative">
                        <div className="w-16 rounded-t-xl bg-gradient-to-t from-green-600 to-green-400 h-40 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-green-300" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                          145 Students
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">2024</span>
                      <span className="text-sm font-bold text-gray-900 bg-green-50 px-3 py-1 rounded-full border border-green-200">145</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="relative">
                        <div className="w-16 rounded-t-xl bg-gradient-to-t from-[#c7243b] to-red-400 h-36 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-red-300" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                          135 Students
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">2025</span>
                      <span className="text-sm font-bold text-gray-900 bg-red-50 px-3 py-1 rounded-full border border-red-200">135</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Trends */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Revenue Trends</h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Last 6 Months
                    </span>
                  </div>

                  <div className="flex items-end justify-around h-48 mt-6">
                    {[
                      { month: "Jul", height: "h-24", amount: "8K" },
                      { month: "Aug", height: "h-32", amount: "10K" },
                      { month: "Sep", height: "h-28", amount: "9K" },
                      { month: "Oct", height: "h-36", amount: "12K" },
                      { month: "Nov", height: "h-40", amount: "13K" },
                      { month: "Dec", height: "h-32", amount: "11K" },
                    ].map((data, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className={`w-10 rounded-t-xl bg-gradient-to-t from-purple-600 to-purple-400 ${data.height} group-hover:scale-110 group-hover:shadow-lg transition-all border-2 border-purple-300`} />
                        <span className="text-xs font-medium text-gray-600">{data.month}</span>
                        <span className="text-xs font-semibold text-purple-600">₹{data.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Attendance Rate */}
                <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">📈</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Attendance Rate</h4>
                    <p className="text-4xl font-bold text-blue-600 mb-2">87%</p>
                    <p className="text-xs text-gray-500 text-center">Average across all batches</p>
                  </div>
                </div>

                {/* Pass Percentage */}
                <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🎓</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Pass Percentage</h4>
                    <p className="text-4xl font-bold text-green-600 mb-2">92%</p>
                    <p className="text-xs text-gray-500 text-center">Excellent performance</p>
                  </div>
                </div>

                {/* Collection Rate */}
                <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-[#c7243b]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#c7243b]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">💰</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Collection Rate</h4>
                    <p className="text-4xl font-bold text-[#c7243b] mb-2">94%</p>
                    <p className="text-xs text-gray-500 text-center">Fee collection efficiency</p>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Demo Analytics Dashboard</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      These are sample analytics to demonstrate the visualization capabilities. Your uploaded data will generate real insights with AI-powered analysis.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* ---------- AI ASSISTANT VIEW ---------- */
            <section>
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#c7243b]/10 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">AI Assistant</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 ml-13">
                  Ask questions about your uploaded Excel data
                </p>

                {/* Suggested Questions */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    💭 Try asking:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      "Total students in Batch A",
                      "Total collected fees in November",
                      "Pending fees by batch",
                      "Show attendance trends",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuestion(preset)}
                        className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-[#c7243b] hover:text-white font-medium border-2 border-gray-200 hover:border-[#c7243b] transition-all transform hover:scale-105"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <div className="flex flex-col space-y-4">
                  <textarea
                    className="w-full min-h-[120px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7243b] focus:border-transparent resize-none bg-gray-50 hover:bg-white hover:border-gray-300 transition-all"
                    placeholder="e.g. Show me all students with pending fees over ₹500..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={handleAskQuestion}
                      disabled={loading}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-[#c7243b] text-white hover:bg-[#a81c30] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <span className="animate-pulse">🤔 Thinking...</span>
                      ) : (
                        <span>✨ Ask Question</span>
                      )}
                    </button>

                    {API_BASE_URL && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        🔗 Connected: {API_BASE_URL}
                      </span>
                    )}
                  </div>

                  {answer && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-5 max-h-64 overflow-y-auto shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-bold text-gray-800">Answer</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadExcel;