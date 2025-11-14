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
  const tableCharts = charts.filter((c) => c.type === "table");

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
    
    // Helper function to parse inline formatting (bold text)
    const parseInlineFormatting = (line) => {
      const parts = [];
      let currentIndex = 0;
      
      // Match **text** or __text__ for bold
      const boldRegex = /(\*\*([^*]+)\*\*|__([^_]+)__)/g;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before the match
        if (match.index > currentIndex) {
          parts.push(line.substring(currentIndex, match.index));
        }
        
        // Add bold text
        const boldText = match[2] || match[3];
        parts.push(
          <strong key={`bold-${match.index}`} className="font-bold text-gray-900">
            {boldText}
          </strong>
        );
        
        currentIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (currentIndex < line.length) {
        parts.push(line.substring(currentIndex));
      }
      
      return parts.length > 0 ? parts : line;
    };
    
    // Split by double line breaks for major sections
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, sectionIdx) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      // Check if this section is a bullet list
      if (lines.some(line => /^[\s]*[-\*•]/.test(line))) {
        return (
          <div key={sectionIdx} className="my-3">
            {lines.map((line, lineIdx) => {
              // Count leading spaces for indentation level
              const leadingSpaces = line.match(/^(\s*)/)[0].length;
              const indentLevel = Math.floor(leadingSpaces / 2);
              const cleanLine = line.replace(/^[\s]*[-\*•]\s*/, '');
              
              return (
                <div
                  key={lineIdx}
                  className="flex items-start gap-2 mb-2"
                  style={{ marginLeft: `${indentLevel * 20}px` }}
                >
                  <span className="text-[#c7243b] font-bold mt-0.5 flex-shrink-0">
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
      
      // Check if this section is a numbered list
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
      
      // Check if it's a heading (ends with :)
      if (lines.length === 1 && lines[0].trim().endsWith(':')) {
        const headingText = lines[0].trim();
        return (
          <h4 key={sectionIdx} className="font-bold text-gray-900 mt-4 mb-2 text-base">
            {parseInlineFormatting(headingText)}
          </h4>
        );
      }
      
      // Regular paragraph(s)
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
        background: #f1f5f9;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ---------- VERTICAL BAR CHART ----------
  const renderVerticalBarChart = (chart, color = "blue") => {
    if (!chart) return null;
    const { title, data } = chart;
    const heights = normalizeBars(data.values);
    
    const colorMap = {
      blue: "from-blue-600 to-blue-400 border-blue-300",
      purple: "from-purple-600 to-purple-400 border-purple-300",
      red: "from-red-600 to-red-400 border-red-300",
      green: "from-green-600 to-green-400 border-green-300",
    };

    const barColor = colorMap[color] || colorMap.blue;
    
    // Calculate if we need horizontal scroll (more than 6 bars)
    const needsScroll = data.labels.length > 6;
    const minWidth = needsScroll ? `${data.labels.length * 80}px` : 'auto';

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Live Data
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-visible pb-4 custom-scrollbar">
          <div className="flex items-end justify-around h-56 mt-6" style={{ minWidth }}>
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const height = heights[idx];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0"
                  style={{ minWidth: '70px' }}
                >
                  <div className="relative">
                    <div
                      className={`w-10 rounded-t-xl bg-gradient-to-t ${barColor} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border-2`}
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap z-10">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center max-w-[80px] break-words">
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {needsScroll && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400 italic">← Scroll horizontally to view all →</span>
          </div>
        )}
      </div>
    );
  };

  // ---------- HORIZONTAL BAR CHART ----------
  const renderHorizontalBarChart = (chart, color = "blue") => {
    if (!chart) return null;
    const { title, data } = chart;
    
    const max = Math.max(...data.values);
    
    const colorMap = {
      blue: { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
      purple: { bg: "bg-purple-500", hover: "hover:bg-purple-600" },
      red: { bg: "bg-red-500", hover: "hover:bg-red-600" },
      green: { bg: "bg-green-500", hover: "hover:bg-green-600" },
    };

    const colors = colorMap[color] || colorMap.blue;
    
    // Calculate if we need vertical scroll (more than 8 bars)
    const needsScroll = data.labels.length > 8;
    const maxHeight = needsScroll ? '400px' : 'auto';

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Live Data
          </span>
        </div>

        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ maxHeight }}>
          <div className="space-y-4 pr-2">
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const percentage = max > 0 ? (value / max) * 100 : 0;
              
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 break-words pr-2">{label}</span>
                    <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} ${colors.hover} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {needsScroll && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-400 italic">↕ Scroll to view all items</span>
          </div>
        )}
      </div>
    );
  };

  // ---------- PIE/DONUT CHART ----------
  const renderPieChart = (chart) => {
    if (!chart) return null;
    const { title, data } = chart;
    
    const total = data.values.reduce((sum, val) => sum + val, 0);
    
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#8B5CF6", // purple
      "#F59E0B", // amber
      "#EF4444", // red
      "#06B6D4", // cyan
      "#EC4899", // pink
      "#14B8A6", // teal
    ];

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
        color: colors[idx % colors.length],
      };
    });
    
    const hasMany = slices.length > 6;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Live Data
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Donut Chart */}
          <div className="relative w-64 h-64 flex-shrink-0">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="40"
              />
              {slices.map((slice, idx) => {
                const startAngle = (slice.startAngle * Math.PI) / 180;
                const endAngle = (slice.endAngle * Math.PI) / 180;
                
                const x1 = 100 + 80 * Math.cos(startAngle);
                const y1 = 100 + 80 * Math.sin(startAngle);
                const x2 = 100 + 80 * Math.cos(endAngle);
                const y2 = 100 + 80 * Math.sin(endAngle);
                
                const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                
                const pathData = `
                  M 100 100
                  L ${x1} ${y1}
                  A 80 80 0 ${largeArc} 1 ${x2} ${y2}
                  Z
                `;
                
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
              {/* Inner circle for donut effect */}
              <circle cx="100" cy="100" r="50" fill="white" />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>

          {/* Legend with scroll if many items */}
          <div 
            className={`${hasMany ? 'max-h-64 overflow-y-auto pr-2 custom-scrollbar' : ''} space-y-3`}
            style={hasMany ? { scrollbarWidth: 'thin' } : {}}
          >
            {slices.map((slice, idx) => (
              <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                <div
                  className="w-4 h-4 rounded-full group-hover:scale-125 transition-transform flex-shrink-0"
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
        
        {hasMany && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-400 italic">↕ Scroll legend to view all categories</span>
          </div>
        )}
      </div>
    );
  };

  // ---------- LINE CHART ----------
  const renderLineChart = (chart) => {
    if (!chart) return null;
    const { title, data } = chart;
    
    const max = Math.max(...data.values);
    const min = Math.min(...data.values);
    const range = max - min;
    
    const chartHeight = 250; // Increased height to accommodate rotated labels
    // Dynamic width based on number of data points
    const baseWidth = 600;
    const pointWidth = 40; // pixels per data point
    const chartWidth = Math.max(baseWidth, data.values.length * pointWidth);
    const paddingLeft = 70; // Increased for Y-axis labels
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 80; // Increased significantly to prevent label cutoff
    
    const points = data.values.map((value, idx) => {
      const x = paddingLeft + (idx / (data.values.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = paddingTop + (chartHeight - paddingTop - paddingBottom) - ((value - min) / range) * (chartHeight - paddingTop - paddingBottom);
      return { x, y, value };
    });
    
    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');
    
    const needsScroll = data.values.length > 15;
    
    // Helper function to format dates to dd-mm-yyyy
    const formatDateLabel = (label) => {
      if (!label) return '';
      
      try {
        let dateStr = label;
        
        // Remove timestamp if present
        if (typeof dateStr === 'string') {
          // Handle ISO format (2024-01-15T10:30:00)
          if (dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
          }
          // Handle format with space and time (2024-01-15 10:30:00)
          if (dateStr.includes(':')) {
            dateStr = dateStr.split(' ')[0];
          }
        }
        
        // Now convert to dd-mm-yyyy
        // Check if it's in yyyy-mm-dd format
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            // Assuming format is yyyy-mm-dd
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            return `${day}-${month}-${year}`;
          }
        }
        
        // If it's already a Date object or can be parsed as one
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
        
        // Return as-is if we can't parse it
        return label;
      } catch (error) {
        return label;
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow col-span-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Live Data
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-visible pb-6 custom-scrollbar">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            style={{ minWidth: `${chartWidth}px`, height: `${chartHeight}px` }}
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = paddingTop + (i / 4) * (chartHeight - paddingTop - paddingBottom);
              const value = max - (i / 4) * range;
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 5}
                    textAnchor="end"
                    className="text-xs fill-gray-600 font-medium"
                  >
                    {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}
            
            {/* Y-axis line */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={chartHeight - paddingBottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            
            {/* X-axis line */}
            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            
            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Area under line */}
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${paddingLeft} ${chartHeight - paddingBottom} Z`}
              fill="url(#lineGradient)"
              opacity="0.2"
            />
            
            {/* Data points */}
            {points.map((point, idx) => (
              <g key={idx}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#3B82F6"
                  className="hover:r-7 transition-all cursor-pointer"
                />
                <title>{`${formatDateLabel(data.labels[idx])}: ${point.value.toLocaleString()}`}</title>
              </g>
            ))}
            
            {/* X-axis labels - show more labels when there's space */}
            {data.labels.map((label, idx) => {
              const skipFactor = needsScroll ? Math.ceil(data.labels.length / 15) : Math.ceil(data.labels.length / 10);
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
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {needsScroll && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400 italic">← Scroll horizontally to view all data points →</span>
          </div>
        )}
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
            <div className="relative flex w-full max-w-2xl rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl border-2 border-gray-200/50 p-1.5 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
              {[
                { id: "analytics", label: "📊 Analytics" },
                { id: "assistant", label: "🤖 Ask AI" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-12 py-4 text-sm font-semibold rounded-xl transition-all duration-500 ease-out min-w-[200px] ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#c7243b] to-[#a81c30] text-white shadow-lg shadow-[#c7243b]/30 scale-100 transform"
                      : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:scale-105"
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
                  {/* Summary Metrics */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Total Rows */}
                    <div className="group bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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

                  {/* All Charts in Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Render all vertical bar charts */}
                    {barCharts.map((chart, idx) => (
                      <React.Fragment key={`bar-${idx}`}>
                        {renderVerticalBarChart(chart, idx % 2 === 0 ? "blue" : "purple")}
                      </React.Fragment>
                    ))}
                    
                    {/* Render all pie charts */}
                    {pieCharts.map((chart, idx) => (
                      <React.Fragment key={`pie-${idx}`}>
                        {renderPieChart(chart)}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Horizontal bar charts - full width or 2 columns based on count */}
                  {charts.filter(c => c.type === "horizontal_bar" || 
                    (c.title && (c.title.toLowerCase().includes("outstanding") || 
                    c.title.toLowerCase().includes("paid amount by source")))).length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {charts
                        .filter(c => c.type === "horizontal_bar" || 
                          (c.title && (c.title.toLowerCase().includes("outstanding") || 
                          c.title.toLowerCase().includes("paid amount by source"))))
                        .map((chart, idx) => (
                          <React.Fragment key={`hbar-${idx}`}>
                            {renderHorizontalBarChart(chart, idx % 2 === 0 ? "blue" : "purple")}
                          </React.Fragment>
                        ))}
                    </div>
                  )}

                  {/* Line charts - full width */}
                  {lineCharts.map((chart, idx) => (
                    <React.Fragment key={`line-${idx}`}>
                      {renderLineChart(chart)}
                    </React.Fragment>
                  ))}

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

                  {/* All Data Tables - Display all tables from the response */}
                  {tableCharts.length > 0 && (
                    <div className="space-y-6">
                      {tableCharts.map((tableChart, tableIdx) => {
                        const isExecutiveReport = tableChart.category === "executive_report";
                        const colorScheme = isExecutiveReport 
                          ? { 
                              border: "border-purple-200", 
                              headerBg: "from-purple-100 to-purple-50",
                              headerBorder: "border-purple-200",
                              icon: "📈",
                              iconBg: "bg-purple-500"
                            }
                          : { 
                              border: "border-gray-200", 
                              headerBg: "from-gray-100 to-gray-50",
                              headerBorder: "border-gray-200",
                              icon: "📊",
                              iconBg: "bg-gray-500"
                            };

                        return (
                          <div 
                            key={`table-${tableIdx}`} 
                            className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${colorScheme.border}`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-xl ${colorScheme.iconBg} flex items-center justify-center`}>
                                <span className="text-2xl">{colorScheme.icon}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {tableChart.title || "Data Table"}
                                </h3>
                                {isExecutiveReport && (
                                  <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full mt-1 inline-block">
                                    Executive Report
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="min-w-full text-xs border-collapse">
                                <thead>
                                  <tr className={`bg-gradient-to-r ${colorScheme.headerBg}`}>
                                    {tableChart.data.headers.map((h, i) => (
                                      <th
                                        key={i}
                                        className={`border-2 ${colorScheme.headerBorder} px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide`}
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
                                      className={`transition-colors ${
                                        rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                      } hover:bg-${isExecutiveReport ? 'purple' : 'gray'}-100`}
                                    >
                                      {row.map((cell, cIdx) => {
                                        // Special styling for priority/status columns
                                        const isPriority = String(cell).toUpperCase() === "HIGH" || 
                                                         String(cell).toUpperCase() === "MEDIUM" ||
                                                         String(cell).toUpperCase() === "LOW";
                                        const isStatus = String(cell) === "✓";
                                        
                                        let cellClass = "border border-gray-200 px-3 py-2 text-gray-600";
                                        
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
                                          <td
                                            key={cIdx}
                                            className={cellClass}
                                          >
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
                          </div>
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
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c7243b] to-[#a81c30] flex items-center justify-center shadow-md">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-gray-500">
                      Powered by advanced analytics
                    </p>
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
                      "Total students in Batch A",
                      "Total collected fees in November",
                      "Pending fees by batch",
                      "Show attendance trends",
                      "Students with highest fees",
                      "Monthly revenue breakdown",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuestion(preset)}
                        className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-[#c7243b] hover:to-[#a81c30] hover:text-white font-medium border-2 border-gray-200 hover:border-[#c7243b] transition-all transform hover:scale-105 hover:shadow-md"
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
                      className="w-full min-h-[120px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7243b] focus:border-transparent resize-none bg-gray-50 hover:bg-white hover:border-gray-300 transition-all placeholder-gray-400"
                      placeholder="e.g., Show me all students with pending fees over ₹500, or calculate total revenue by month..."
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#c7243b] to-[#a81c30] text-white hover:from-[#a81c30] hover:to-[#8a1625] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
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

                  {/* Empty state - shown when no answer yet */}
                  {!answer && !loadingChat && (
                    <div className="mt-6 text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl opacity-50">💬</span>
                      </div>
                      <p className="text-sm text-gray-500 italic">
                        Your AI response will appear here...
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  {answer && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-200 p-6 max-h-96 overflow-y-auto shadow-inner custom-scrollbar">
                      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                            <span className="text-xl">💡</span>
                          </div>
                          <span className="font-bold text-gray-800 text-lg">
                            AI Response
                          </span>
                        </div>
                        <button
                          onClick={handleCopyResponse}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-blue-100 border-2 border-blue-200 transition-all duration-200 group"
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <>
                              <span className="text-green-600 text-sm font-medium">✓ Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Copy</span>
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
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-green-50 via-white to-green-50 border-2 border-green-200 p-6 shadow-inner">
                      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                            <span className="text-xl">📊</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-lg block">
                              Data Results
                            </span>
                            <span className="text-xs text-gray-500">
                              {table.shape?.[0]} rows × {table.shape?.[1] || table.columns.length} columns
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar max-h-80 overflow-y-auto">
                        <table className="min-w-full text-xs border-collapse">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-gradient-to-r from-green-100 to-green-50">
                              {table.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="border-2 border-green-200 px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap"
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
                                className={`transition-colors hover:bg-green-50 ${
                                  rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="border border-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap"
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