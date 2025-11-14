import React, { useState } from "react";

// meta.env → Vite style
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:8000

const Dashboard = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      if (!API_BASE_URL) {
        setAnswer(
          "Set VITE_API_BASE_URL in your .env file to connect the backend."
        );
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered insights for Jetking Institute
            </p>
          </div>
          
         
        </header>

        {/* KPI Cards - Enhanced with hover effects */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 ">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">135</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">
              +8 new this month
            </span>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-[#c7243b]/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fees Collected</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹12,450</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#c7243b]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-3 py-1.5 rounded-full bg-[#c7243b]/10 text-[#c7243b] font-medium border border-[#c7243b]/30">
              92% of target reached
            </span>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Fees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹1,500</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 font-medium border border-orange-200">
              Requires follow-ups
            </span>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
              Stable performance
            </span>
          </div>
        </section>

        {/* Toggle Button - More Prominent */}
          <div className="relative flex w-full md:w-auto rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-0.9 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            {[
              { id: "analytics", label: "📊 Analytics" },
              { id: "assistant", label: "🤖 AI Assistant" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-500 ease-out  ${
                  activeTab === tab.id
                    ? "bg-[#c7243b] text-white shadow-md scale-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        {/* CONTENT AREA */}
        {activeTab === "analytics" ? (
          /* ---------- ANALYTICS VIEW ---------- */
          <section className="space-y-6">
            {/* Students by Batch */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Students by Batch</h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                  Hover for details
                </span>
              </div>

              <div className="flex items-end justify-around h-48 mt-6">
                {/* Batch A */}
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-16 rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 h-32 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-blue-300" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                      45 Students
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Batch A</span>
                  <span className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">45</span>
                </div>
                
                {/* Batch B */}
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-16 rounded-t-xl bg-gradient-to-t from-green-600 to-green-400 h-28 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-green-300" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                      38 Students
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Batch B</span>
                  <span className="text-sm font-bold text-gray-900 bg-green-50 px-3 py-1 rounded-full border border-green-200">38</span>
                </div>
                
                {/* Batch C */}
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-16 rounded-t-xl bg-gradient-to-t from-red-600 to-red-400 h-36 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2 border-red-300" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                      52 Students
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Batch C</span>
                  <span className="text-sm font-bold text-gray-900 bg-red-50 px-3 py-1 rounded-full border border-red-200">52</span>
                </div>
              </div>
            </div>

            {/* Fees + Pending & Attendance row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Fees Collected */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Fees Collected
                </h3>

                <div className="flex items-end justify-around h-40 mt-4">
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 rounded-t-xl bg-gradient-to-t from-purple-600 to-purple-400 h-20 group-hover:scale-110 group-hover:shadow-lg transition-all border-2 border-purple-300" />
                    <span className="text-xs font-medium text-gray-600">Oct</span>
                    <span className="text-xs font-semibold text-purple-600">₹4K</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 rounded-t-xl bg-gradient-to-t from-purple-600 to-purple-400 h-32 group-hover:scale-110 group-hover:shadow-lg transition-all border-2 border-purple-300" />
                    <span className="text-xs font-medium text-gray-600">Nov</span>
                    <span className="text-xs font-semibold text-purple-600">₹6K</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 rounded-t-xl bg-gradient-to-t from-purple-600 to-purple-400 h-24 group-hover:scale-110 group-hover:shadow-lg transition-all border-2 border-purple-300" />
                    <span className="text-xs font-medium text-gray-600">Dec</span>
                    <span className="text-xs font-semibold text-purple-600">₹2.5K</span>
                  </div>
                </div>

                <div className="mt-6 text-center p-4 bg-gradient-to-r from-[#c7243b]/5 to-[#c7243b]/10 rounded-xl border-2 border-[#c7243b]/20">
                  <p className="text-3xl font-bold text-[#c7243b]">
                    ₹12,450
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Total collected this period
                  </p>
                </div>
              </div>

              {/* Pending + Attendance combo */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow flex flex-col gap-6">
                {/* Pending */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Pending Fees by Batch
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-colors">
                      <span className="text-sm font-medium text-gray-700">Batch A</span>
                      <span className="text-sm font-bold text-orange-600">₹500</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-colors">
                      <span className="text-sm font-medium text-gray-700">Batch B</span>
                      <span className="text-sm font-bold text-orange-600">₹200</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-colors">
                      <span className="text-sm font-medium text-gray-700">Batch C</span>
                      <span className="text-sm font-bold text-orange-600">₹800</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#c7243b]/5 rounded-xl border-2 border-[#c7243b]/20 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Total Pending</span>
                    <span className="text-lg font-bold text-[#c7243b]">₹1,500</span>
                  </div>
                </div>

                {/* Attendance */}
                <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Attendance Overview</p>
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[10px] border-[#c7243b] border-t-gray-200 border-l-gray-200 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-[#c7243b]">
                        87%
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-600 font-medium">
                    Average attendance this period
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
                Ask anything about your batches, fees, or attendance data
              </p>

              {/* Chat area */}
              <div className="flex flex-col space-y-4">
                <textarea
                  className="w-full min-h-[140px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7243b] focus:border-transparent resize-none bg-gray-50 hover:bg-white hover:border-gray-300 transition-all"
                  placeholder="e.g. Show total students per batch with pending fees over ₹500..."
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
                      <>
                        <span className="animate-pulse">🤔 Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Ask Question</span>
                      </>
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

              {/* Suggested prompts */}
              <div className="border-t-2 border-gray-100 pt-5 mt-6">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  💭 Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Total students in each batch",
                    "Pending fees list by batch",
                    "Compare attendance of Batch A vs B",
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;