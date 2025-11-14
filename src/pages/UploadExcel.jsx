import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { useChatAssistant } from "../hooks/useChatAssistant";

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [question, setQuestion] = useState("");

  const navigate = useNavigate();

  const {
    dashboard,
    fileId,
    uploading,
    loadingDashboard,
    error: dashboardError,
    uploadAndFetchDashboard,
  } = useDashboard();

  const {
    answer,
    table,
    loadingChat,
    chatError,
    askQuestion,
    setAnswer,
  } = useChatAssistant();

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    try {
      await uploadAndFetchDashboard(file);
      setFileUploaded(true);
      setShowModal(false);
      setActiveTab("analytics");
    } catch (err) {
      alert("Upload or analytics loading failed. Check console for details.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setAnswer("");
    await askQuestion(question, fileId);
    setActiveTab("assistant");
  };

  // ---------- DASHBOARD MAPPING ----------
  const charts = dashboard?.charts || [];
  const summary = dashboard?.summary || null;
  const insights = dashboard?.insights || [];

  const summaryTable = charts.find((c) => c.type === "table") || null;
  const barCharts = charts.filter((c) => c.type === "bar");
  const bar1 =
    barCharts.find((c) =>
      c.title.toLowerCase().includes("course category")
    ) || barCharts[0] || null;
  const bar2 =
    barCharts.find(
      (c) =>
        c !== bar1 &&
        (c.title.toLowerCase().includes("student status") ||
          c.title.toLowerCase().includes("source"))
    ) || barCharts[1] || null;

  const normalizeBars = (values, maxHeight = 160) => {
    if (!values || values.length === 0) return [];
    const max = Math.max(...values);
    if (max <= 0) return values.map(() => 10);
    return values.map((v) => (v / max) * maxHeight + 10); // +10 so even small values show
  };

  const renderBarCard = (chart, color = "blue") => {
    if (!chart) return null;
    const { title, data } = chart;
    const heights = normalizeBars(data.values);
    const colorClassMap = {
      blue: "from-blue-600 to-blue-400 border-blue-300 bg-blue-50 border-blue-200 text-blue-600",
      purple:
        "from-purple-600 to-purple-400 border-purple-300 text-purple-600",
      red: "from-[#c7243b] to-red-400 border-red-300",
    };

    const mainBarColor =
      color === "purple"
        ? "from-purple-600 to-purple-400 border-purple-300"
        : "from-blue-600 to-blue-400 border-blue-300";

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Live Data
          </span>
        </div>

        <div className="flex items-end justify-around h-56 mt-6">
          {data.labels.map((label, idx) => {
            const value = data.values[idx];
            const height = heights[idx];
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="relative">
                  <div
                    className={`w-10 rounded-t-xl bg-gradient-to-t ${mainBarColor} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                    {value.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 text-center max-w-[80px]">
                  {label}
                </span>
                <span className="text-xs font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                  {value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {data.x_label || data.y_label ? (
          <div className="mt-4 flex justify-between text-[10px] text-gray-400">
            <span>{data.x_label}</span>
            <span>{data.y_label}</span>
          </div>
        ) : null}
      </div>
    );
  };

  // ---------- SUMMARY METRICS ----------
  const totalRows = summary?.total_rows ?? "-";
  const numericColumns = summary?.numeric_columns ?? "-";
  const missingValues = summary?.missing_values ?? "-";

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
              <span className="text-gray-600 group-hover:text-gray-900 text-2xl font-light">
                ×
              </span>
            </button>

            {/* Modal Content */}
            <div className="p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-4 border-2 border-blue-200">
                  <span className="text-5xl">☁️</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Upload Excel File
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Choose an Excel file containing student and fee data to unlock
                  AI-powered insights
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
                    <p className="text-sm text-green-700 font-medium">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-10 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "⬆️ Upload & Continue"}
                  </button>
                </div>
              )}

              {dashboardError && (
                <p className="mt-4 text-center text-xs text-red-500">
                  {dashboardError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showModal && (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="w-full">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Data Management
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {fileUploaded
                ? `Analyzing: ${file?.name || "your file"}`
                : "Upload Excel files and explore analytics"}
            </p>
          </div>

          {/* Header with Toggle */}
          <header className="flex flex-col items-center gap-4">
            <div className="relative flex w-full md:w-auto rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-1 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
              {[
                { id: "analytics", label: "📊 Analytics" },
                { id: "assistant", label: "🤖 Ask AI" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-7 py-3 text-xs font-semibold rounded-xl transition-all duration-500 ease-out ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#c7243b] to-[#a81c30] text-white shadow-lg shadow-[#c7243b]/30 scale-100 transform"
                      : "text-gray-600 hover:bg.white/60 hover:text-gray-900 hover:scale-105"
                  }`}
                >
                  <span
                    className={`relative z-10 transition-all duration-500 ${
                      activeTab === tab.id ? "tracking-wide" : ""
                    }`}
                  >
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
            <section className="space-y-6">
              {loadingDashboard && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 text-sm text-gray-500">
                  Loading analytics from backend...
                </div>
              )}

              {!loadingDashboard && !dashboard && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 text-sm text-gray-500">
                  No analytics available yet. Upload an Excel file to see
                  insights.
                </div>
              )}

              {dashboard && (
                <>
                  {/* Two bar charts */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {renderBarCard(bar1, "blue")}
                    {renderBarCard(bar2, "purple")}
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Total Rows */}
                    <div className="group bg.white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-3xl">👥</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          Total Students
                        </h4>
                        <p className="text-4xl font-bold text-blue-600 mb-2">
                          {totalRows}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          Rows in your uploaded file
                        </p>
                      </div>
                    </div>

                    {/* Numeric Columns */}
                    <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-3xl">📊</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          Numeric Columns
                        </h4>
                        <p className="text-4xl font-bold text-green-600 mb-2">
                          {numericColumns}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          Columns used for calculations
                        </p>
                      </div>
                    </div>

                    {/* Missing Values */}
                    <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-[#c7243b]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#c7243b]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          Missing Values
                        </h4>
                        <p className="text-3xl font-bold text-[#c7243b] mb-2">
                          {missingValues}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          Cells with missing data
                        </p>
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
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          Insights from your Excel
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {insights[0] ||
                            "Your uploaded data is analyzed to surface key patterns across fees, outstanding amounts, and student behavior."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Optional: show summary statistics table */}
                  {summaryTable && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        {summaryTable.title || "Summary Statistics"}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              {summaryTable.data.headers.map((h, i) => (
                                <th
                                  key={i}
                                  className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {summaryTable.data.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={
                                  rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="border border-gray-200 px-3 py-1 text-gray-600"
                                  >
                                    {typeof cell === "number"
                                      ? cell.toLocaleString()
                                      : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            /* ---------- AI ASSISTANT VIEW ---------- */
            <section>
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#c7243b]/10 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    AI Assistant
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 ml-3">
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
                      disabled={loadingChat}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-[#c7243b] text-white hover:bg-[#a81c30] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      {loadingChat ? (
                        <span className="animate-pulse">🤔 Thinking...</span>
                      ) : (
                        <span>✨ Ask Question</span>
                      )}
                    </button>

                    {chatError && (
                      <span className="text-xs text-red-500">
                        {chatError}
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  {answer && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-5 max-h-64 overflow-y-auto shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-bold text-gray-800">
                          Answer
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  )}

                  {/* Result Table */}
                  {table && table.type === "dataframe" && (
                    <div className="mt-4 rounded-xl bg-white border-2 border-gray-200 p-5 shadow-inner overflow-x-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📋</span>
                        <span className="font-bold text-gray-800">
                          Result Table ({table.shape?.[0]} rows)
                        </span>
                      </div>
                      <table className="min-w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            {table.columns.map((col, idx) => (
                              <th
                                key={idx}
                                className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={
                                rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="border border-gray-200 px-3 py-1 text-gray-600"
                                >
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
