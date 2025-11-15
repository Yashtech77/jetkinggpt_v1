// import React, { useState } from "react";
// import {
//   Database,
//   Sparkles,
//   BarChart3,
//   MessageSquare,
//   AlertCircle,
//   TrendingUp,
//   Table as TableIcon,
// } from "lucide-react";
// import { useDbDashboard } from "../hooks/useDbDashboard";
// import { useAIAssistant } from "../hooks/useAIAssistant";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
// } from "recharts";

// const tableIcons = {
//   users: "👥",
//   orders: "📦",
//   products: "🛍️",
//   sales: "💰",
//   customers: "👨‍💼",
//   inventory: "📊",
//   transactions: "💳",
//   employees: "👔",
//   student_data: "🎓",
// };

// const tableColors = {
//   users: "from-purple-500 to-blue-500",
//   orders: "from-blue-500 to-cyan-500",
//   products: "from-cyan-500 to-teal-500",
//   sales: "from-purple-600 to-pink-500",
//   customers: "from-pink-500 to-rose-500",
//   inventory: "from-teal-500 to-green-500",
//   transactions: "from-orange-500 to-red-500",
//   employees: "from-indigo-500 to-purple-500",
//   student_data: "from-purple-600 to-indigo-600",
// };

// const CHART_COLORS = [
//   "#8b5cf6",
//   "#6366f1",
//   "#3b82f6",
//   "#06b6d4",
//   "#10b981",
//   "#f59e0b",
//   "#ef4444",
//   "#ec4899",
//   "#a855f7",
//   "#6366f1",
// ];

// const ChartRenderer = ({ chart }) => {
//   if (!chart || !chart.type || !chart.data) return null;

//   // ---------- BAR ----------
//   if (chart.type === "bar") {
//     try {
//       const hasLabelsAndValues =
//         Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
//       if (!hasLabelsAndValues) return null;

//       const chartData = chart.data.labels.map((label, idx) => ({
//         name:
//           typeof label === "string" && label.length > 25
//             ? label.substring(0, 25) + "..."
//             : String(label),
//         value: Number(chart.data.values[idx]) || 0,
//         fullName: String(label),
//       }));

//       return (
//         <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
//           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <BarChart3 size={20} className="text-purple-600" />
//             {chart.title || "Bar Chart"}
//           </h4>
//           <ResponsiveContainer width="100%" height={350}>
//             <BarChart
//               data={chartData}
//               margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis
//                 dataKey="name"
//                 angle={-45}
//                 textAnchor="end"
//                 height={100}
//                 interval={0}
//                 tick={{ fontSize: 10, fill: "#6b7280" }}
//               />
//               <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#fff",
//                   border: "2px solid #a855f7",
//                   borderRadius: "8px",
//                   padding: "10px",
//                 }}
//                 formatter={(value) => [
//                   typeof value === "number"
//                     ? value.toLocaleString()
//                     : String(value),
//                   chart.data.y_label || "Value",
//                 ]}
//                 labelFormatter={(label) =>
//                   chartData.find((d) => d.name === label)?.fullName || label
//                 }
//               />
//               <Bar
//                 dataKey="value"
//                 fill="url(#purpleGradient)"
//                 radius={[8, 8, 0, 0]}
//               />
//               <defs>
//                 <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#8b5cf6" />
//                   <stop offset="100%" stopColor="#a855f7" />
//                 </linearGradient>
//               </defs>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       );
//     } catch (error) {
//       console.error("Error rendering bar chart:", error);
//       return null;
//     }
//   }

//   // ---------- PIE ----------
//   if (chart.type === "pie") {
//     try {
//       const hasLabelsAndValues =
//         Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
//       if (!hasLabelsAndValues) return null;

//       const chartData = chart.data.labels
//         .map((label, idx) => ({
//           name: String(label),
//           value: Number(chart.data.values[idx]) || 0,
//         }))
//         .filter((item) => item.value > 0);

//       if (!chartData.length) return null;

//       return (
//         <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
//           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <span className="text-purple-600">📊</span>
//             {chart.title || "Pie Chart"}
//           </h4>
//           <ResponsiveContainer width="100%" height={350}>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine
//                 label={({ name, percent }) =>
//                   `${name}: ${(percent * 100).toFixed(1)}%`
//                 }
//                 outerRadius={100}
//                 fill="#8b5cf6"
//                 dataKey="value"
//               >
//                 {chartData.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={CHART_COLORS[index % CHART_COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip
//                 formatter={(value) => [
//                   typeof value === "number"
//                     ? value.toLocaleString()
//                     : String(value),
//                   "Count",
//                 ]}
//               />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       );
//     } catch (error) {
//       console.error("Error rendering pie chart:", error);
//       return null;
//     }
//   }

//   // ---------- LINE ----------
//   if (chart.type === "line") {
//     try {
//       const hasLabelsAndValues =
//         Array.isArray(chart.data.labels) && Array.isArray(chart.data.values);
//       if (!hasLabelsAndValues) return null;

//       const chartData = chart.data.labels.map((label, idx) => ({
//         name: String(label),
//         value: Number(chart.data.values[idx]) || 0,
//       }));

//       return (
//         <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
//           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <TrendingUp size={20} className="text-purple-600" />
//             {chart.title || "Line Chart"}
//           </h4>
//           <ResponsiveContainer width="100%" height={350}>
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 11, fill: "#6b7280" }}
//               />
//               <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#8b5cf6"
//                 strokeWidth={3}
//                 dot={{ fill: "#8b5cf6", r: 4 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       );
//     } catch (error) {
//       console.error("Error rendering line chart:", error);
//       return null;
//     }
//   }

//   // ---------- TABLE ----------
//   if (chart.type === "table") {
//     try {
//       const hasHeadersAndRows =
//         Array.isArray(chart.data.headers) && Array.isArray(chart.data.rows);
//       if (!hasHeadersAndRows || chart.data.rows.length === 0) return null;

//       return (
//         <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
//           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <TableIcon size={20} className="text-purple-600" />
//             {chart.title || "Data Table"}
//           </h4>
//           <div className="overflow-x-auto rounded-lg border-2 border-gray-200 max-h-96">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
//                   {chart.data.headers.map((header, idx) => (
//                     <th
//                       key={idx}
//                       className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
//                     >
//                       {String(header).replace(/_/g, " ")}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {chart.data.rows.map((row, rowIdx) => (
//                   <tr
//                     key={rowIdx}
//                     className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${
//                       rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
//                     }`}
//                   >
//                     {row.map((cell, cellIdx) => {
//                       const value =
//                         typeof cell === "number"
//                           ? cell.toLocaleString(undefined, {
//                               maximumFractionDigits: 2,
//                             })
//                           : String(cell);

//                       return (
//                         <td
//                           key={cellIdx}
//                           className="px-4 py-3 text-gray-700 whitespace-nowrap"
//                         >
//                           {value}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       );
//     } catch (error) {
//       console.error("Error rendering table:", error);
//       return null;
//     }
//   }

//   // Unknown chart type
//   return null;
// };

// const Dashboard = () => {
//   const {
//     tables,
//     selectedTable,
//     dashboardData,
//     loading,
//     error: dashboardError,
//     tablesLoading,
//     generateDashboard,
//     resetDashboard,
//   } = useDbDashboard();

//   const {
//     question,
//     setQuestion,
//     answer,
//     loading: aiLoading,
//     askQuestion,
//     resetAssistant,
//   } = useAIAssistant();

//   const [tempSelectedTable, setTempSelectedTable] = useState("");
//   const [activeTab, setActiveTab] = useState("analytics");

//   const handleTableSelect = (tableName) => {
//     setTempSelectedTable(tableName);
//   };

//   const handleGenerateDashboard = () => {
//     if (tempSelectedTable) {
//       generateDashboard(tempSelectedTable);
//     }
//   };

//   const handleReset = () => {
//     resetDashboard();
//     resetAssistant();
//     setTempSelectedTable("");
//     setActiveTab("analytics");
//   };

//   const handleAskQuestion = () => {
//     askQuestion(question, selectedTable);
//   };

//   // ---------- TABLES LOADING ----------
//   if (tablesLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading tables...</p>
//         </div>
//       </div>
//     );
//   }

//   // ---------- TABLES ERROR ----------
//   if (dashboardError && !dashboardData && tables.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border-2 border-red-200">
//           <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
//           <h3 className="text-xl font-bold text-gray-900 mb-2">
//             Error Loading Tables
//           </h3>
//           <p className="text-gray-600 mb-4">{dashboardError}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ---------- TABLE SELECTION VIEW ----------
//   if (!dashboardData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8">
//         <div className="max-w-6xl mx-auto">
//           <header className="text-center mb-12">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-4 shadow-lg">
//               <Database className="text-white" size={32} />
//             </div>
//             <h2 className="text-4xl font-bold text-gray-900 mb-2">
//               Analytics Dashboard
//             </h2>
//             <p className="text-gray-600">
//               Select a table to generate AI-powered insights
//             </p>
//           </header>

//           {dashboardError && (
//             <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
//               <AlertCircle className="text-red-500" size={20} />
//               <p className="text-red-700 text-sm">{dashboardError}</p>
//             </div>
//           )}

//           <div className="grid gap-6 md:grid-cols-2 mb-8">
//             {tables.map((table) => (
//               <button
//                 key={table}
//                 onClick={() => handleTableSelect(table)}
//                 className={`group relative overflow-hidden rounded-2xl p-8 border-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
//                   tempSelectedTable === table
//                     ? "border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-105"
//                     : "border-gray-200 bg-white hover:border-purple-300 shadow-md"
//                 }`}
//               >
//                 <div className="flex items-center gap-4">
//                   <div
//                     className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
//                       tableColors[table] || "from-purple-500 to-purple-700"
//                     } flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
//                   >
//                     {tableIcons[table] || "📋"}
//                   </div>
//                   <div className="text-left flex-1">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
//                       {table.replace(/_/g, " ")}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       View {table.replace(/_/g, " ")} analytics
//                     </p>
//                   </div>
//                   {tempSelectedTable === table && (
//                     <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
//                       <span className="text-white text-lg">✓</span>
//                     </div>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>

//           <div className="text-center">
//             <button
//               onClick={handleGenerateDashboard}
//               disabled={!tempSelectedTable || loading}
//               className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg transform ${
//                 tempSelectedTable && !loading
//                   ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-xl active:scale-95"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//                   <span>Generating Dashboard...</span>
//                 </>
//               ) : (
//                 <>
//                   <Sparkles size={20} />
//                   <span>Generate Dashboard</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---------- DASHBOARD VIEW ----------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 tracking-tight capitalize">
//               {selectedTable.replace(/_/g, " ")} Dashboard
//             </h2>
//             <p className="text-sm text-gray-600 mt-1">
//               AI-powered insights and analytics
//             </p>
//           </div>
//           <button
//             onClick={handleReset}
//             className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium shadow-sm"
//           >
//             ← Change Table
//           </button>
//         </header>

//         {/* KPI cards from summary (fully dynamic) */}
//         {dashboardData?.summary &&
//           Object.keys(dashboardData.summary).length > 0 && (
//             <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//               {Object.entries(dashboardData.summary).map(([key, value]) => (
//                 <div
//                   key={key}
//                   className="group bg-white rounded-2xl shadow-md hover:shadow-xl px-6 py-4 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                         {key.replace(/_/g, " ")}
//                       </p>
//                       <p className="text-3xl font-bold text-gray-900 mt-2">
//                         {typeof value === "number"
//                           ? value.toLocaleString(undefined, {
//                               maximumFractionDigits: 0,
//                             })
//                           : String(value)}
//                       </p>
//                     </div>
//                     <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
//                       <TrendingUp className="text-purple-600" size={24} />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </section>
//           )}

//         {/* Toggle */}
//         <div className="flex justify-center">
//           <div className="inline-flex rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-1 hover:shadow-2xl transition-all duration-300">
//             <button
//               onClick={() => setActiveTab("analytics")}
//               className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
//                 activeTab === "analytics"
//                   ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md"
//                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//               }`}
//             >
//               📊 Analytics
//             </button>
//             <button
//               onClick={() => setActiveTab("assistant")}
//               className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
//                 activeTab === "assistant"
//                   ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md"
//                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//               }`}
//             >
//               🤖 AI Assistant
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         {activeTab === "analytics" ? (
//           <section className="space-y-6">
//             {dashboardData?.charts && dashboardData.charts.length > 0 ? (
//               <div className="grid gap-6 lg:grid-cols-2">
//                 {dashboardData.charts.map((chart, idx) => (
//                   <ChartRenderer
//                     key={`${selectedTable}-${chart.type || "chart"}-${
//                       chart.title || "untitled"
//                     }-${idx}`}
//                     chart={chart}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
//                 <BarChart3 className="mx-auto mb-4 text-gray-300" size={48} />
//                 <p className="text-gray-500">
//                   No chart data available for this table
//                 </p>
//               </div>
//             )}

//             {dashboardData?.insights &&
//               Array.isArray(dashboardData.insights) &&
//               dashboardData.insights.length > 0 && (
//                 <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <span>💡</span>
//                     Key Insights
//                   </h3>
//                   <ul className="space-y-3">
//                     {dashboardData.insights.map((insight, idx) => (
//                       <li
//                         key={idx}
//                         className="flex items-start gap-3 text-gray-700"
//                       >
//                         <span className="text-purple-600 font-bold mt-0.5 text-lg">
//                           •
//                         </span>
//                         <span className="text-sm leading-relaxed">
//                           {insight}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//           </section>
//         ) : (
//           <section>
//             <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow max-w-4xl mx-auto">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
//                   <MessageSquare className="text-purple-600" size={20} />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800">
//                   AI Assistant
//                 </h3>
//               </div>
//               <p className="text-sm text-gray-600 mb-6 ml-13">
//                 Ask questions about your{" "}
//                 {selectedTable.replace(/_/g, " ")} data
//               </p>

//               <div className="flex flex-col space-y-4">
//                 <textarea
//                   className="w-full min-h-[140px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white hover:border-gray-300 transition-all"
//                   placeholder={`e.g. What are the top insights from ${selectedTable.replace(
//                     /_/g,
//                     " "
//                   )}?`}
//                   value={question}
//                   onChange={(e) => setQuestion(e.target.value)}
//                 />

//                 <div className="flex items-center justify-between gap-3 flex-wrap">
//                   <button
//                     onClick={handleAskQuestion}
//                     disabled={aiLoading || !question.trim()}
//                     className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
//                   >
//                     {aiLoading ? (
//                       <span className="animate-pulse">🤔 Thinking...</span>
//                     ) : (
//                       <span>✨ Ask Question</span>
//                     )}
//                   </button>
//                 </div>

//                 {answer && (
//                   <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-5 max-h-96 overflow-y-auto shadow-inner">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="text-lg">💡</span>
//                       <span className="font-bold text-gray-800">Answer</span>
//                     </div>
//                     <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
//                       {answer}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="border-t-2 border-gray-100 pt-5 mt-6">
//                 <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
//                   💭 Suggested Questions
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {[
//                     `Show summary statistics`,
//                     `What are the key insights?`,
//                     `Analyze trends and patterns`,
//                   ].map((preset) => (
//                     <button
//                       key={preset}
//                       type="button"
//                       onClick={() => setQuestion(preset)}
//                       className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white font-medium border-2 border-gray-200 hover:border-purple-600 transition-all transform hover:scale-105"
//                     >
//                       {preset}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState } from "react";
import {
  Database,
  Sparkles,
  BarChart3,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Table as TableIcon,
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
  users: "👥",
  orders: "📦",
  products: "🛍️",
  sales: "💰",
  customers: "👨‍💼",
  inventory: "📊",
  transactions: "💳",
  employees: "👔",
  student_data: "🎓",
};

const tableColors = {
  users: "from-purple-500 to-blue-500",
  orders: "from-blue-500 to-cyan-500",
  products: "from-cyan-500 to-teal-500",
  sales: "from-purple-600 to-pink-500",
  customers: "from-pink-500 to-rose-500",
  inventory: "from-teal-500 to-green-500",
  transactions: "from-orange-500 to-red-500",
  employees: "from-indigo-500 to-purple-500",
  student_data: "from-purple-600 to-indigo-600",
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

  // ---------- BAR ----------
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

  // ---------- PIE ----------
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

  // ---------- LINE ----------
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

  // ---------- TABLE ----------
  if (chart.type === "table") {
    try {
      const hasHeadersAndRows =
        Array.isArray(chart.data.headers) && Array.isArray(chart.data.rows);
      if (!hasHeadersAndRows || chart.data.rows.length === 0) return null;

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TableIcon size={20} className="text-purple-600" />
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

  // ---------- DATAFRAME (from AI response) ----------
  if (chart.type === "dataframe") {
    try {
      const hasColumnsAndRows =
        Array.isArray(chart.columns) && Array.isArray(chart.rows);
      if (!hasColumnsAndRows || chart.rows.length === 0) return null;

      return (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TableIcon size={20} className="text-purple-600" />
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

  // Unknown chart type
  return null;
};

const Dashboard = () => {
  const {
    tables,
    selectedTable,
    dashboardData,
    loading,
    error: dashboardError,
    tablesLoading,
    generateDashboard,
    resetDashboard,
  } = useDbDashboard();

  const {
    question,
    setQuestion,
    answer,
    visualization,
    loading: aiLoading,
    error: aiError,
    askQuestion,
    resetAssistant,
  } = useAIAssistant();

  const [tempSelectedTable, setTempSelectedTable] = useState("");
  const [activeTab, setActiveTab] = useState("analytics");

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
    setActiveTab("analytics");
  };

  const handleAskQuestion = () => {
    if (question.trim() && selectedTable) {
      askQuestion(question, selectedTable);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !aiLoading && question.trim()) {
      handleAskQuestion();
    }
  };

  // ---------- TABLES LOADING ----------
  if (tablesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tables...</p>
        </div>
      </div>
    );
  }

  // ---------- TABLES ERROR ----------
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

  // ---------- TABLE SELECTION VIEW ----------
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-4 shadow-lg">
              <Database className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600">
              Select a table to generate AI-powered insights
            </p>
          </header>

          {dashboardError && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-700 text-sm">{dashboardError}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => handleTableSelect(table)}
                className={`group relative overflow-hidden rounded-2xl p-8 border-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                  tempSelectedTable === table
                    ? "border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-105"
                    : "border-gray-200 bg-white hover:border-purple-300 shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                      tableColors[table] || "from-purple-500 to-purple-700"
                    } flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {tableIcons[table] || "📋"}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                      {table.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      View {table.replace(/_/g, " ")} analytics
                    </p>
                  </div>
                  {tempSelectedTable === table && (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
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
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg transform ${
                tempSelectedTable && !loading
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-xl active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Generating Dashboard...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD VIEW ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
            className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium shadow-sm"
          >
            ← Change Table
          </button>
        </header>

        {/* KPI cards from summary (fully dynamic) */}
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

        {/* Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-1 hover:shadow-2xl transition-all duration-300">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab("assistant")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === "assistant"
                  ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              🤖 AI Assistant
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "analytics" ? (
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
        ) : (
          <section>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="text-purple-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  AI Assistant
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 ml-13">
                Ask questions about your{" "}
                {selectedTable.replace(/_/g, " ")} data
              </p>

              {/* Error Display */}
              {aiError && (
                <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                  <p className="text-red-700 text-sm">{aiError}</p>
                </div>
              )}

              <div className="flex flex-col space-y-4">
                <textarea
                  className="w-full min-h-[140px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white hover:border-gray-300 transition-all"
                  placeholder={`e.g. What are the top insights from ${selectedTable.replace(
                    /_/g,
                    " "
                  )}?`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={aiLoading}
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button
                    onClick={handleAskQuestion}
                    disabled={aiLoading || !question.trim()}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    {aiLoading ? (
                      <span className="animate-pulse">🤔 Thinking...</span>
                    ) : (
                      <span>✨ Ask Question</span>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">
                    Press Ctrl+Enter to send
                  </p>
                </div>

                {/* Answer Text */}
                {answer && (
                  <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-5 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💡</span>
                      <span className="font-bold text-gray-800">Answer</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {answer}
                    </p>
                  </div>
                )}

                {/* Visualization Chart */}
                {visualization && (
                  <div className="mt-4">
                    <ChartRenderer chart={visualization} />
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-100 pt-5 mt-6">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  💭 Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2">
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
                      className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white font-medium border-2 border-gray-200 hover:border-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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