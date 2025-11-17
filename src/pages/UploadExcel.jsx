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
  const [copied, setCopied] = useState(false);

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

  const handleCopyResponse = () => {
    if (answer) {
      navigator.clipboard.writeText(answer).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  // ---------- CHART MAPPING ----------
  const charts = dashboard?.charts || [];
  const summary = dashboard?.summary || null;
  const insights = dashboard?.insights || [];

  // Categorize charts by type
  const barCharts = charts.filter((c) => c.type === "bar");
  const pieCharts = charts.filter((c) => c.type === "pie");
  const lineCharts = charts.filter((c) => c.type === "line");
  const horizontalBarCharts = charts.filter(c => c.type === "horizontal_bar" || 
    (c.title && (c.title.toLowerCase().includes("outstanding") || 
    c.title.toLowerCase().includes("paid amount by source"))));
  const tableCharts = charts.filter((c) => c.type === "table");

  // Professional purple color palette
  const purpleTheme = {
    primary: {
      gradient: "from-purple-600 via-purple-500 to-indigo-600",
      solid: "#7c3aed",
      light: "#a78bfa",
      lighter: "#ddd6fe"
    },
    charts: [
      { gradient: "from-purple-600 to-purple-400", border: "border-purple-300", bg: "bg-purple-500" },
      { gradient: "from-indigo-600 to-indigo-400", border: "border-indigo-300", bg: "bg-indigo-500" },
      { gradient: "from-violet-600 to-violet-400", border: "border-violet-300", bg: "bg-violet-500" },
      { gradient: "from-fuchsia-600 to-fuchsia-400", border: "border-fuchsia-300", bg: "bg-fuchsia-500" },
    ],
    pieColors: [
      "#7c3aed", "#6366f1", "#8b5cf6", "#a855f7", 
      "#c026d3", "#d946ef", "#e879f9", "#f0abfc"
    ]
  };

  // ---------- HELPER FUNCTIONS ----------
  const normalizeBars = (values, maxHeight = 160) => {
    if (!values || values.length === 0) return [];
    const max = Math.max(...values);
    if (max <= 0) return values.map(() => 10);
    return values.map((v) => (v / max) * maxHeight + 10);
  };

  // Format AI response for better readability
  const formatAIResponse = (text) => {
    if (!text) return null;
    
    const parseInlineFormatting = (line) => {
      const parts = [];
      let currentIndex = 0;
      const boldRegex = /(\*\*([^*]+)\*\*|__([^_]+)__)/g;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > currentIndex) {
          parts.push(line.substring(currentIndex, match.index));
        }
        const boldText = match[2] || match[3];
        parts.push(
          <strong key={`bold-${match.index}`} className="font-bold text-gray-900">
            {boldText}
          </strong>
        );
        currentIndex = match.index + match[0].length;
      }
      
      if (currentIndex < line.length) {
        parts.push(line.substring(currentIndex));
      }
      
      return parts.length > 0 ? parts : line;
    };
    
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, sectionIdx) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      if (lines.some(line => /^[\s]*[-\*•]/.test(line))) {
        return (
          <div key={sectionIdx} className="my-3">
            {lines.map((line, lineIdx) => {
              const leadingSpaces = line.match(/^(\s*)/)[0].length;
              const indentLevel = Math.floor(leadingSpaces / 2);
              const cleanLine = line.replace(/^[\s]*[-\*•]\s*/, '');
              
              return (
                <div
                  key={lineIdx}
                  className="flex items-start gap-2 mb-2"
                  style={{ marginLeft: `${indentLevel * 20}px` }}
                >
                  <span className="text-purple-600 font-bold mt-0.5 flex-shrink-0">
                    {indentLevel > 0 ? '◦' : '•'}
                  </span>
                  <span className="flex-1 text-gray-700">
                    {parseInlineFormatting(cleanLine)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }
      
      if (lines.some(line => /^\d+\./.test(line))) {
        return (
          <ol key={sectionIdx} className="space-y-2 my-3 ml-5">
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^\d+\.\s*/, '');
              return (
                <li key={lineIdx} className="text-gray-700 list-decimal">
                  {parseInlineFormatting(cleanLine)}
                </li>
              );
            })}
          </ol>
        );
      }
      
      if (lines.length === 1 && lines[0].trim().endsWith(':')) {
        const headingText = lines[0].trim();
        return (
          <h4 key={sectionIdx} className="font-bold text-gray-900 mt-4 mb-2 text-base">
            {parseInlineFormatting(headingText)}
          </h4>
        );
      }
      
      return (
        <div key={sectionIdx} className="my-3">
          {lines.map((line, lineIdx) => (
            <p key={lineIdx} className="text-gray-700 leading-relaxed mb-2">
              {parseInlineFormatting(line)}
            </p>
          ))}
        </div>
      );
    });
  };

  // Add custom styles for scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f5f3ff;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a78bfa, #8b5cf6);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Format date labels
  const formatDateLabel = (label) => {
    if (!label) return '';
    
    try {
      let dateStr = label;
      
      if (typeof dateStr === 'string') {
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
        }
        if (dateStr.includes(':')) {
          dateStr = dateStr.split(' ')[0];
        }
      }
      
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          return `${day}-${month}-${year}`;
        }
      }
      
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
      
      return label;
    } catch (error) {
      return label;
    }
  };

  // ---------- STANDARDIZED CHART CONTAINER ----------
  const ChartContainer = ({ title, children, fullWidth = false }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-semibold">
            Live Data
          </span>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  // ---------- VERTICAL BAR CHART ----------
  const renderVerticalBarChart = (chart, colorIdx = 0) => {
    if (!chart) return null;
    const { title, data } = chart;
    const heights = normalizeBars(data.values);
    const colors = purpleTheme.charts[colorIdx % purpleTheme.charts.length];

    return (
      <ChartContainer title={title}>
        <div className="h-80 overflow-x-auto overflow-y-visible custom-scrollbar">
          <div className="flex items-end justify-around h-64 min-w-max px-4" style={{ minWidth: `${Math.max(data.labels.length * 80, 400)}px` }}>
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const height = heights[idx];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                  style={{ minWidth: '70px' }}
                >
                  <div className="relative">
                    <div
                      className={`w-12 rounded-t-lg bg-gradient-to-t ${colors.gradient} group-hover:scale-105 transition-all duration-300 border ${colors.border} shadow-md`}
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap z-10 shadow-xl">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center max-w-[80px] break-words">
                    {label}
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </ChartContainer>
    );
  };

  // ---------- HORIZONTAL BAR CHART ----------
  const renderHorizontalBarChart = (chart, colorIdx = 0) => {
    if (!chart) return null;
    const { title, data } = chart;
    const max = Math.max(...data.values);
    const colors = purpleTheme.charts[colorIdx % purpleTheme.charts.length];

    return (
      <ChartContainer title={title}>
        <div className="h-80 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
          <div className="space-y-4">
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const percentage = max > 0 ? (value / max) * 100 : 0;
              
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700 break-words pr-2">{label}</span>
                    <span className="text-sm font-bold text-purple-700 whitespace-nowrap">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  </div>
                  <div className="w-full bg-purple-50 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 rounded-full flex items-center justify-end pr-2 shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartContainer>
    );
  };

  // ---------- PIE/DONUT CHART ----------
  const renderPieChart = (chart) => {
    if (!chart) return null;
    const { title, data } = chart;
    const total = data.values.reduce((sum, val) => sum + val, 0);

    let currentAngle = -90;
    const slices = data.labels.map((label, idx) => {
      const value = data.values[idx];
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        label,
        value,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: purpleTheme.pieColors[idx % purpleTheme.pieColors.length],
      };
    });

    return (
      <ChartContainer title={title}>
        <div className="h-80 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-56 h-56 flex-shrink-0">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f5f3ff" strokeWidth="40" />
                {slices.map((slice, idx) => {
                  const startAngle = (slice.startAngle * Math.PI) / 180;
                  const endAngle = (slice.endAngle * Math.PI) / 180;
                  const x1 = 100 + 80 * Math.cos(startAngle);
                  const y1 = 100 + 80 * Math.sin(startAngle);
                  const x2 = 100 + 80 * Math.cos(endAngle);
                  const y2 = 100 + 80 * Math.sin(endAngle);
                  const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                  const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  
                  return (
                    <path
                      key={idx}
                      d={pathData}
                      fill={slice.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                <circle cx="100" cy="100" r="50" fill="white" />
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-700">{total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
              {slices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-full group-hover:scale-125 transition-transform flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate" title={slice.label}>
                      {slice.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ChartContainer>
    );
  };

  // ---------- LINE CHART ----------
  const renderLineChart = (chart) => {
    if (!chart) return null;
    const { title, data } = chart;
    
    const max = Math.max(...data.values);
    const min = Math.min(...data.values);
    const range = max - min || 1;
    
    const chartHeight = 280;
    const chartWidth = Math.max(600, data.values.length * 50);
    const paddingLeft = 70;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 80;
    
    const points = data.values.map((value, idx) => {
      const x = paddingLeft + (idx / (data.values.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = paddingTop + (chartHeight - paddingTop - paddingBottom) - ((value - min) / range) * (chartHeight - paddingTop - paddingBottom);
      return { x, y, value };
    });
    
    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
      <ChartContainer title={title} fullWidth={true}>
        <div className="h-80 overflow-x-auto overflow-y-visible custom-scrollbar">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            style={{ minWidth: `${chartWidth}px`, height: `${chartHeight}px` }}
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const y = paddingTop + (i / 4) * (chartHeight - paddingTop - paddingBottom);
              const value = max - (i / 4) * range;
              return (
                <g key={i}>
                  <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#f5f3ff" strokeWidth="1" />
                  <text x={paddingLeft - 10} y={y + 5} textAnchor="end" className="text-xs fill-gray-600 font-medium">
                    {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}
            
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={chartHeight - paddingBottom} stroke="#a78bfa" strokeWidth="2" />
            <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="#a78bfa" strokeWidth="2" />
            
            <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${paddingLeft} ${chartHeight - paddingBottom} Z`} fill="url(#areaGradient)" opacity="0.3" />
            
            {points.map((point, idx) => (
              <g key={idx}>
                <circle cx={point.x} cy={point.y} r="5" fill="white" stroke="#7c3aed" strokeWidth="2" className="hover:r-7 transition-all cursor-pointer" />
                <title>{`${formatDateLabel(data.labels[idx])}: ${point.value.toLocaleString()}`}</title>
              </g>
            ))}
            
            {data.labels.map((label, idx) => {
              const skipFactor = Math.ceil(data.labels.length / 12);
              if (idx % skipFactor === 0 || idx === data.labels.length - 1) {
                return (
                  <text
                    key={idx}
                    x={points[idx].x}
                    y={chartHeight - paddingBottom + 25}
                    textAnchor="end"
                    className="text-[11px] fill-gray-600 font-medium"
                    transform={`rotate(-45 ${points[idx].x} ${chartHeight - paddingBottom + 25})`}
                  >
                    {formatDateLabel(label)}
                  </text>
                );
              }
              return null;
            })}
            
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </ChartContainer>
    );
  };

  // ---------- RENDER SUMMARY METRICS DYNAMICALLY ----------
  const renderSummaryMetrics = () => {
    if (!summary) return null;
    
    const metrics = Object.entries(summary).map(([key, value], idx) => {
      // Convert snake_case to Title Case
      const label = key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      const icons = ['📊', '💯', '⚠️', '📈', '🎯', '💰', '👥', '📋'];
      const icon = icons[idx % icons.length];
      
      return (
        <div key={key} className="group bg-white rounded-xl shadow-md p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <span className="text-2xl">{icon}</span>
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 text-center">
              {label}
            </h4>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
      );
    });

    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {metrics}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-8">
      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative animate-fadeIn">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center transition-all duration-300 hover:rotate-90 group"
            >
              <span className="text-gray-600 group-hover:text-purple-600 text-2xl font-light">×</span>
            </button>

            <div className="p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4 border-2 border-purple-200">
                  <span className="text-5xl">☁️</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Upload Excel File
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Choose an Excel file to unlock AI-powered insights and analytics
                </p>
              </div>

              <div className="border-2 border-dashed border-purple-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 group mb-6">
                <input
                  type="file"
                  className="hidden"
                  id="excelInput"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <label
                  htmlFor="excelInput"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                >
                  📁 Choose File
                </label>

                {file && (
                  <div className="mt-4 flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border-2 border-purple-200">
                    <span className="text-purple-600">✓</span>
                    <p className="text-sm text-purple-700 font-medium">{file.name}</p>
                  </div>
                )}
              </div>

              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "⬆️ Upload & Continue"}
                  </button>
                </div>
              )}

              {dashboardError && (
                <p className="mt-4 text-center text-xs text-red-500">{dashboardError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showModal && (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="w-full">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Data Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {fileUploaded ? `Analyzing: ${file?.name || "your file"}` : "Upload Excel files and explore analytics"}
            </p>
          </div>

          {/* Header with Toggle */}
          <header className="flex flex-col items-center gap-4">
            <div className="relative flex w-full max-w-2xl rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl border-2 border-purple-200/50 p-1.5 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
              {[
                { id: "analytics", label: "📊 Analytics" },
                { id: "assistant", label: "🤖 Ask AI" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-12 py-4 text-base font-bold rounded-xl transition-all duration-500 ease-out min-w-[200px] ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-300/50 scale-100 transform"
                      : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:scale-105"
                  }`}
                >
                  <span className={`relative z-10 transition-all duration-500 ${activeTab === tab.id ? "tracking-wide" : ""}`}>
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
                <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                  <p className="text-sm text-gray-500">Loading analytics from backend...</p>
                </div>
              )}

              {!loadingDashboard && !dashboard && (
                <div className="bg-white rounded-xl shadow-lg p-12 border border-purple-100 text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📊</span>
                  </div>
                  <p className="text-gray-500">No analytics available yet. Upload an Excel file to see insights.</p>
                </div>
              )}

              {dashboard && (
                <>
                  {/* Summary Metrics - Dynamic */}
                  {renderSummaryMetrics()}

                  {/* Insights Banner - Dynamic */}
                  {insights.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 rounded-xl shadow-md p-6 border border-purple-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-2xl">💡</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-2">Key Insights</h4>
                          <div className="space-y-2">
                            {insights.map((insight, idx) => (
                              <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                                • {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Charts in Grid - 2 columns, standardized size */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Vertical Bar Charts */}
                    {barCharts.map((chart, idx) => (
                      <React.Fragment key={`bar-${idx}`}>
                        {renderVerticalBarChart(chart, idx)}
                      </React.Fragment>
                    ))}
                    
                    {/* Pie Charts */}
                    {pieCharts.map((chart, idx) => (
                      <React.Fragment key={`pie-${idx}`}>
                        {renderPieChart(chart)}
                      </React.Fragment>
                    ))}

                    {/* Horizontal Bar Charts */}
                    {horizontalBarCharts.map((chart, idx) => (
                      <React.Fragment key={`hbar-${idx}`}>
                        {renderHorizontalBarChart(chart, idx)}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Line Charts - Full Width */}
                  {lineCharts.map((chart, idx) => (
                    <React.Fragment key={`line-${idx}`}>
                      {renderLineChart(chart)}
                    </React.Fragment>
                  ))}

                  {/* Data Tables */}
                  {tableCharts.length > 0 && (
                    <div className="space-y-6">
                      {tableCharts.map((tableChart, tableIdx) => {
                        const isExecutiveReport = tableChart.category === "executive_report";
                        
                        return (
                          <ChartContainer 
                            key={`table-${tableIdx}`} 
                            title={tableChart.title || "Data Table"}
                            fullWidth={true}
                          >
                            {isExecutiveReport && (
                              <span className="inline-block text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1 rounded-full mb-4">
                                Executive Report
                              </span>
                            )}
                            <div className="h-80 overflow-auto custom-scrollbar">
                              <table className="min-w-full text-xs border-collapse">
                                <thead className="sticky top-0 z-10">
                                  <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                                    {tableChart.data.headers.map((h, i) => (
                                      <th
                                        key={i}
                                        className="border border-purple-200 px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableChart.data.rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={`transition-colors hover:bg-purple-50 ${
                                        rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                      }`}
                                    >
                                      {row.map((cell, cIdx) => {
                                        const isPriority = String(cell).toUpperCase() === "HIGH" || 
                                                         String(cell).toUpperCase() === "MEDIUM" ||
                                                         String(cell).toUpperCase() === "LOW";
                                        const isStatus = String(cell) === "✓";
                                        
                                        let cellClass = "border border-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap";
                                        
                                        if (isPriority) {
                                          const priorityColors = {
                                            HIGH: "bg-red-100 text-red-800 font-bold",
                                            MEDIUM: "bg-yellow-100 text-yellow-800 font-bold",
                                            LOW: "bg-green-100 text-green-800 font-bold"
                                          };
                                          cellClass += ` ${priorityColors[String(cell).toUpperCase()]}`;
                                        } else if (isStatus) {
                                          cellClass += " text-green-600 font-bold text-center text-lg";
                                        }
                                        
                                        return (
                                          <td key={cIdx} className={cellClass}>
                                            {typeof cell === "number"
                                              ? cell.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                              : String(cell)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </ChartContainer>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            /* ---------- AI ASSISTANT VIEW ---------- */
            <section>
              <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">AI Assistant</h3>
                    <p className="text-xs text-gray-500">Powered by advanced analytics</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 ml-3">
                  Ask questions about your uploaded Excel data and get instant insights
                </p>

                {/* Suggested Questions */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">💭</span>
                    Try asking:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      "Show me summary statistics",
                      "What are the key trends?",
                      "Analyze the data patterns",
                      "Show top 10 records",
                      "Calculate totals by category",
                      "Find anomalies",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuestion(preset)}
                        className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-700 hover:from-purple-500 hover:to-indigo-500 hover:text-white font-medium border border-purple-200 hover:border-purple-500 transition-all transform hover:scale-105 hover:shadow-md"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <textarea
                      className="w-full min-h-[120px] rounded-xl border-2 border-purple-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-purple-50/30 hover:bg-white hover:border-purple-300 transition-all placeholder-gray-400"
                      placeholder="e.g., Show me the top performing categories, or analyze trends over time..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {question.length} characters
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={handleAskQuestion}
                      disabled={loadingChat || !question.trim()}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                      {loadingChat ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Thinking...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">✨</span>
                          <span>Ask Question</span>
                        </>
                      )}
                    </button>

                    {chatError && (
                      <span className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        ⚠️ {chatError}
                      </span>
                    )}
                  </div>

                  {/* Empty state */}
                  {!answer && !loadingChat && (
                    <div className="mt-6 text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-4xl opacity-50">💬</span>
                      </div>
                      <p className="text-sm text-gray-500 italic">
                        Your AI response will appear here...
                      </p>
                    </div>
                  )}

                  {/* AI Response */}
                  {answer && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-200 p-6 max-h-96 overflow-y-auto shadow-inner custom-scrollbar">
                      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm">
                            <span className="text-xl">💡</span>
                          </div>
                          <span className="font-bold text-gray-800 text-lg">AI Response</span>
                        </div>
                        <button
                          onClick={handleCopyResponse}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-purple-100 border-2 border-purple-200 transition-all duration-200 group"
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <span className="text-green-600 text-sm font-medium">✓ Copied!</span>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-600 group-hover:text-purple-600">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {formatAIResponse(answer)}
                      </div>
                    </div>
                  )}

                  {/* Result Table */}
                  {table && table.type === "dataframe" && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-200 p-6 shadow-inner">
                      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm">
                            <span className="text-xl">📊</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-lg block">Data Results</span>
                            <span className="text-xs text-gray-500">
                              {table.shape?.[0]} rows × {table.shape?.[1] || table.columns.length} columns
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-80 overflow-auto custom-scrollbar">
                        <table className="min-w-full text-xs border-collapse">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                              {table.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="border-2 border-purple-200 px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap"
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
                                className={`transition-colors hover:bg-purple-50 ${
                                  rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="border border-purple-200 px-4 py-2 text-gray-700 whitespace-nowrap"
                                  >
                                    {typeof cell === 'number' 
                                      ? cell.toLocaleString(undefined, { maximumFractionDigits: 2 })
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