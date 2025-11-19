import React, { useState, useEffect } from "react";import {
  Database,
  Sparkles,
  BarChart3,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Table,
  X,
  Send,
} from "lucide-react";

import { useDbDashboard } from "../hooks/useDbDashboard";
import { useAIAssistant } from "../hooks/useAIAssistant";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const tableIcons = {
  student_data: "🎓",
  students: "🧑‍🎓",
  enrollments: "📝",
  centers: "🏫",
  courses: "📚",
  enrollment_status: "📌",
  jetking_student_details: "🗂️",
  payment_details: "💳",
  merged_student_data: "🔀",
};

const tableColors = {
  student_data: "from-purple-600 to-indigo-600",
  students: "from-purple-600 to-indigo-600",
  enrollments: "from-purple-600 to-indigo-600",
  centers: "from-purple-600 to-indigo-600",
  courses: "from-purple-600 to-indigo-600",
  enrollment_status: "from-purple-600 to-indigo-600",
  jetking_student_details: "from-purple-600 to-indigo-600",
  payment_details: "from-purple-600 to-indigo-600",
  merged_student_data: "from-purple-600 to-indigo-600",
};

const CHART_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
];

const ChartRenderer = ({ chart }) => {
  if (!chart || !chart.type || !chart.data) return null;

  if (chart.type === "bar") {
    try {
      const hasLabelsAndValues =
        Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
      if (!hasLabelsAndValues) return null;

      const chartData = chart.data.labels.map((label, idx) => ({
        name:
          typeof label === "string" && label.length > 25
            ? label.substring(0, 25) + "..."
            : String(label),
        value: Number(chart.data.values[idx]) || 0,
        fullName: String(label),
      }));

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            {chart.title || "Bar Chart"}
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #a855f7",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value) => [
                  typeof value === "number"
                    ? value.toLocaleString()
                    : String(value),
                  chart.data.y_label || "Value",
                ]}
                labelFormatter={(label) =>
                  chartData.find((d) => d.name === label)?.fullName || label
                }
              />
              <Bar
                dataKey="value"
                fill="url(#purpleGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } catch (error) {
      console.error("Error rendering bar chart:", error);
      return null;
    }
  }

  if (chart.type === "pie") {
    try {
      const hasLabelsAndValues =
        Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
      if (!hasLabelsAndValues) return null;

      const chartData = chart.data.labels
        .map((label, idx) => ({
          name: String(label),
          value: Number(chart.data.values[idx]) || 0,
        }))
        .filter((item) => item.value > 0);

      if (!chartData.length) return null;

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📊</span>
            {chart.title || "Pie Chart"}
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8b5cf6"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  typeof value === "number"
                    ? value.toLocaleString()
                    : String(value),
                  "Count",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    } catch (error) {
      console.error("Error rendering pie chart:", error);
      return null;
    }
  }

  if (chart.type === "line") {
    try {
      const hasLabelsAndValues =
        Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
      if (!hasLabelsAndValues) return null;

      const chartData = chart.data.labels.map((label, idx) => ({
        name: String(label),
        value: Number(chart.data.values[idx]) || 0,
      }));

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            {chart.title || "Line Chart"}
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } catch (error) {
      console.error("Error rendering line chart:", error);
      return null;
    }
  }

  if (chart.type === "table") {
    try {
      const hasHeadersAndRows =
        Array.isArray(chart.data.headers) && Array.isArray(chart.data.rows);
      if (!hasHeadersAndRows || chart.data.rows.length === 0) return null;

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Table size={20} className="text-purple-600" />
            {chart.title || "Data Table"}
          </h4>
          <div className="overflow-x-auto rounded-lg border-2 border-gray-200 max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  {chart.data.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                    >
                      {String(header).replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.data.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${
                      rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {row.map((cell, cellIdx) => {
                      const value =
                        typeof cell === "number"
                          ? cell.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : String(cell);

                      return (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 text-gray-700 whitespace-nowrap"
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering table:", error);
      return null;
    }
  }

  if (chart.type === "dataframe") {
    try {
      const hasColumnsAndRows =
        Array.isArray(chart.columns) && Array.isArray(chart.rows);
      if (!hasColumnsAndRows || chart.rows.length === 0) return null;

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Table size={20} className="text-purple-600" />
            {chart.title || "Data Result"}
          </h4>
          <div className="overflow-x-auto rounded-lg border-2 border-gray-200 max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  {chart.columns.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                    >
                      {String(header).replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${
                      rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {row.map((cell, cellIdx) => {
                      const value =
                        typeof cell === "number"
                          ? cell.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : String(cell);

                      return (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 text-gray-700 whitespace-nowrap"
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering dataframe:", error);
      return null;
    }
  }

  return null;
};

const Dashboard = ({ isAssistantOpen, setIsAssistantOpen }) => {
  const dbDashboard = useDbDashboard();
const aiAssistant = useAIAssistant();




const [chatHistory, setChatHistory] = useState([]);
const [lastAskedQuestion, setLastAskedQuestion] = useState(null);

  const {
    tables = [],
    selectedTable = "",
    dashboardData = null,
    loading = false,
    error: dashboardError = null,
    tablesLoading = false,
    generateDashboard = () => {},
    resetDashboard = () => {},
  } = dbDashboard || {};

  const {
    question = "",
    setQuestion = () => {},
    answer = null,
    visualization = null,
    loading: aiLoading = false,
    error: aiError = null,
    askQuestion = () => {},
    resetAssistant = () => {},
  } = aiAssistant || {};

  const [tempSelectedTable, setTempSelectedTable] = useState("");
  
   const [isAIChatOpen, setIsAIChatOpen] = useState(isAssistantOpen || false);

  const toggleAIChat = () => {
    setIsAIChatOpen((prev) => {
      const next = !prev;

      // Inform App.jsx so Sidebar collapses
      if (setIsAssistantOpen) setIsAssistantOpen(next);

      return next;
    });
  };

  const handleTableSelect = (tableName) => {
    setTempSelectedTable(tableName);
  };

  const handleGenerateDashboard = () => {
    if (tempSelectedTable) {
      generateDashboard(tempSelectedTable);
    }
  };

  const handleReset = () => {
  resetDashboard();
  resetAssistant();
  setTempSelectedTable("");
  setIsAIChatOpen(false);
  setChatHistory([]);
  setLastAskedQuestion(null);
};


 const handleAskQuestion = () => {
  if (question.trim() && selectedTable) {
    const q = question.trim();

    // store what we actually asked
    setLastAskedQuestion(q);

    // fire the request
    askQuestion(q, selectedTable);

    // clear the text area
    setQuestion("");
  }
};


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !aiLoading && question.trim()) {
      handleAskQuestion();
    }
  };

  useEffect(() => {
  if (!lastAskedQuestion) return;
  if (!answer && !visualization) return;

  setChatHistory((prev) => [
    ...prev,
    {
      question: lastAskedQuestion,
      answer,
      visualization,
    },
  ]);

  // So we only record this question once
  setLastAskedQuestion(null);
}, [answer, visualization, lastAskedQuestion]);
  

  if (tablesLoading) {
    return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8 relative">      
  <div className="text-center">
   <div
        className={`max-w-7xl mx-auto space-y-8 transition-all duration-300 ${
          isAIChatOpen ? "mr-96" : ""
        }`}
      ></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (dashboardError && !dashboardData && tables.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border-2 border-red-200">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Tables
          </h3>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-3 shadow-md">
              <Database className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Analytics Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Select a table to generate AI-powered insights
            </p>
          </header>

          {dashboardError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-red-700 text-xs">{dashboardError}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => handleTableSelect(table)}
                className={`group relative overflow-hidden rounded-xl p-4 border transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg ${
                  tempSelectedTable === table
                    ? "border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-md"
                    : "border-gray-200 bg-white hover:border-purple-300 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      tableColors[table] || "from-purple-500 to-purple-700"
                    } flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {tableIcons[table] || "📋"}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-0.5 capitalize">
                      {table.replace(/_/g, " ")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      View {table.replace(/_/g, " ")} analytics
                    </p>
                  </div>
                  {tempSelectedTable === table && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerateDashboard}
              disabled={!tempSelectedTable || loading}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md transform ${
                tempSelectedTable && !loading
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-lg active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8 relative">
      <div className={`max-w-7xl mx-auto space-y-8 transition-all duration-300 ${isAIChatOpen ? 'mr-96' : ''}`}>
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight capitalize">
              {selectedTable.replace(/_/g, " ")} Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered insights and analytics
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-1 py-1 rounded-lg mr-12 bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium shadow-sm"
          >
            ← Change Table
          </button>
        </header>

        {dashboardData?.summary &&
          Object.keys(dashboardData.summary).length > 0 && (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(dashboardData.summary).map(([key, value]) => (
                <div
                  key={key}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {typeof value === "number"
                          ? value.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })
                          : String(value)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

        <section className="space-y-6">
          {dashboardData?.charts && dashboardData.charts.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {dashboardData.charts.map((chart, idx) => (
                <ChartRenderer
                  key={`${selectedTable}-${chart.type || "chart"}-${
                    chart.title || "untitled"
                  }-${idx}`}
                  chart={chart}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
              <BarChart3 className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500">
                No chart data available for this table
              </p>
            </div>
          )}

          {dashboardData?.insights &&
            Array.isArray(dashboardData.insights) &&
            dashboardData.insights.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Key Insights
                </h3>
                <ul className="space-y-3">
                  {dashboardData.insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="text-purple-600 font-bold mt-0.5 text-lg">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </section>
      </div>

      <button
  onClick={toggleAIChat}
  className="fixed top-6 right-6 z-40 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
  title={isAIChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
>
  {isAIChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
</button>

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l-2 border-purple-100 ${
          isAIChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-xl font-bold">AI Assistant</h3>
              </div>
            </div>
            <p className="text-sm text-purple-100">
              Ask questions about {selectedTable.replace(/_/g, " ")} data
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {aiError && (
  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
    <p className="text-red-700 text-sm">{aiError}</p>
  </div>
)}

<div>
  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
    💭 Suggested Questions
  </p>
  <div className="flex flex-col gap-2">
    {[
      `Show summary statistics`,
      `What are the key insights?`,
      `Analyze trends and patterns`,
    ].map((preset) => (
      <button
        key={preset}
        type="button"
        onClick={() => setQuestion(preset)}
        disabled={aiLoading}
        className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white font-medium border-2 border-gray-200 hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {preset}
      </button>
    ))}
  </div>
</div>

{/* Chat history */}
<div className="mt-4 space-y-4">
  {chatHistory.map((item, idx) => (
    <div key={idx} className="space-y-3">
      {/* User question bubble */}
      <div className="rounded-xl bg-white border-2 border-gray-200 p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">🧑‍💻</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">You</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {item.question}
            </p>
          </div>
        </div>
      </div>

      {/* AI answer bubble */}
      {item.answer && (
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h4 className="text-sm font-bold text-gray-900">AI Response</h4>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {item.answer}
          </div>
        </div>
      )}

      {/* Chart with its own scrollbars */}
      {item.visualization && (
        <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-purple-100">
          <ChartRenderer chart={item.visualization} />
        </div>
      )}
    </div>
  ))}

  {/* Optional loading bubble */}
  {aiLoading && (
    <div className="rounded-xl bg-white border-2 border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
        <p className="text-xs text-gray-500">Thinking about your question...</p>
      </div>
    </div>
  )}
</div>

          </div>

          <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your data..."
                rows={3}
                disabled={aiLoading}
                className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleAskQuestion}
                disabled={aiLoading || !question.trim()}
                className={`self-end px-4 py-3 rounded-xl transition-all transform ${
                  aiLoading || !question.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 active:scale-95 shadow-md"
                }`}
              >
                {aiLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Ctrl+Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;