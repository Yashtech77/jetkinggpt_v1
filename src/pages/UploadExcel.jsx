import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { useChatAssistant } from "../hooks/useChatAssistant";
import { MessageSquare, X, Send, Copy, Check } from "lucide-react";

const UploadExcel = ({ isAssistantOpen, setIsAssistantOpen }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(isAssistantOpen || false);

  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);
  // const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [copied, setCopied] = useState(false);

   // ✅ ADD THESE:
  const [chatHistory, setChatHistory] = useState([]);
  const [lastAskedQuestion, setLastAskedQuestion] = useState(null);

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

    // ✅ Build chat history when a new answer/table arrives
  useEffect(() => {
    if (!lastAskedQuestion) return;
    if (!answer && !table) return;

    setChatHistory((prev) => [
      ...prev,
      {
        question: lastAskedQuestion,
        answer,
        table,
      },
    ]);

    // prevent duplicate pushes
    setLastAskedQuestion(null);
  }, [answer, table, lastAskedQuestion]);


   // Load file info from localStorage on mount
  useEffect(() => {
    const storedFileId = localStorage.getItem('uploadedFileId');
    const storedFileName = localStorage.getItem('uploadedFileName');
   
    if (storedFileId && storedFileName) {
      setFileUploaded(true);
      setShowModal(false);
    }
  }, []);
 
  // Save file info to localStorage when fileId changes
  useEffect(() => {
    if (fileId && file) {
      localStorage.setItem('uploadedFileId', fileId);
      localStorage.setItem('uploadedFileName', file.name);
    }
  }, [fileId, file]);
 
  // Clear localStorage when component unmounts or user navigates away
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      localStorage.removeItem('uploadedFileId');
      localStorage.removeItem('uploadedFileName');
    };
  }, []);
 
  // Also clear localStorage when user leaves the page (browser back, close, refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('uploadedFileId');
      localStorage.removeItem('uploadedFileName');
    };
 
    window.addEventListener('beforeunload', handleBeforeUnload);
   
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    try {
      await uploadAndFetchDashboard(file);
      setFileUploaded(true);
      setShowModal(false);
    } catch (err) {
      alert("Upload or analytics loading failed. Check console for details.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

    const handleAskQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    
    // Get fileId from state or localStorage
    const currentFileId = fileId || localStorage.getItem('uploadedFileId');
    
    if (!currentFileId) {
      alert("No file uploaded. Please upload a file first.");
      return;
    }

    // ✅ Remember what we asked
    setLastAskedQuestion(trimmed);

    // Clear current visible answer before new one
    setAnswer("");
    
    // ✅ Clear the textarea immediately
    setQuestion("");

    // Ask the backend
    await askQuestion(trimmed, currentFileId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !loadingChat && question.trim()) {
      handleAskQuestion();
    }
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

  const toggleAIChat = () => {
  setIsAIChatOpen((prev) => {
    const next = !prev;

    // Inform App.jsx so Sidebar can react
    if (setIsAssistantOpen) setIsAssistantOpen(next);

    return next;
  });
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
      { gradient: "from-purple-600 to-purple-400", border: "border-purple-300", bg: "bg-purple-500" },
      { gradient: "from-violet-600 to-violet-400", border: "border-violet-300", bg: "bg-violet-500" },
      { gradient: "from-violet-600 to-violet-400", border: "border-violet-300", bg: "bg-violet-500" },
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

  const getStoredFileName = () => {
    return file?.name || localStorage.getItem('uploadedFileName') || 'your file';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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

      {/* AI Assistant Toggle Button - Fixed Position */}
      {fileUploaded && !showModal && (
        <button
          onClick={() => setIsAssistantOpen((prev) => !prev)}
          className="fixed top-6 right-6 z-40 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          title={isAssistantOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isAssistantOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      )}

      {/* Sliding AI Chat Panel - Fixed Position */}
      {fileUploaded && !showModal && (
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l-2 border-purple-100 ${
            isAssistantOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
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
                Ask questions about {getStoredFileName()}
              </p>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {chatError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <p className="text-red-700 text-sm">{chatError}</p>
                </div>
              )}

              {/* Suggested Questions */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  💭 Suggested Questions
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    "Show summary statistics",
                    "What are the key insights?",
                    "Analyze trends and patterns",
                    "Show top 10 records",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuestion(preset)}
                      disabled={loadingChat}
                      className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white font-medium border-2 border-gray-200 hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

                            {/* Chat History: questions + answers (+ tables) */}
              {chatHistory.length > 0 && (
                <div className="space-y-4">
                  {chatHistory.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      {/* User question */}
                      <div className="rounded-xl bg-white border-2 border-gray-200 p-4 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">🧑‍💻</span>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              You
                            </p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {item.question}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI answer */}
                      {item.answer && (
                        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-5 shadow-inner">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🤖</span>
                              <h4 className="text-sm font-bold text-gray-900">
                                AI Response
                              </h4>
                            </div>

                            {/* Copy only for latest answer */}
                            {idx === chatHistory.length - 1 && (
                              <button
                                onClick={handleCopyResponse}
                                className="p-1.5 rounded-lg hover:bg-purple-100 transition-all"
                                title="Copy to clipboard"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {formatAIResponse(item.answer)}
                          </div>
                        </div>
                      )}

                      {/* Result table for this answer, if any */}
                      {item.table && item.table.type === "dataframe" && (
                        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-100">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm">
                              <span className="text-lg">📊</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 text-sm block">
                                Data Results
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.table.shape?.[0]} rows ×{" "}
                                {item.table.shape?.[1] || item.table.columns.length} columns
                              </span>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-auto custom-scrollbar">
                            <table className="min-w-full text-xs border-collapse">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                                  {item.table.columns.map((col, colIdx) => (
                                    <th
                                      key={colIdx}
                                      className="border-2 border-purple-200 px-3 py-2 text-left font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.table.rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={`transition-colors hover:bg-purple-50 ${
                                      rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }`}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="border border-purple-200 px-3 py-2 text-gray-700 whitespace-nowrap"
                                      >
                                        {typeof cell === "number"
                                          ? cell.toLocaleString(undefined, {
                                              maximumFractionDigits: 2,
                                            })
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
                  ))}
                </div>
              )}

              {/* Empty State */}
              {chatHistory.length === 0 && !loadingChat && !chatError && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-3xl opacity-50">💬</span>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    Your AI response will appear here...
                  </p>
                </div>
              )}

            </div>

            {/* Input Area */}
            <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your data..."
                  rows={3}
                  disabled={loadingChat}
                  className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={loadingChat || !question.trim()}
                  className={`self-end px-4 py-3 rounded-xl transition-all transform ${
                    loadingChat || !question.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 active:scale-95 shadow-md"
                  }`}
                >
                  {loadingChat ? (
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
      )}

      {/* Main Content - Analytics Dashboard with proper margin */}
      {!showModal && (
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isAssistantOpen ? 'mr-96' : 'mr-0'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
            <div className="w-full">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                Analytics Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {fileUploaded ? `Analyzing: ${getStoredFileName()}` : "Upload Excel files to explore analytics"}
              </p>
            </div>

            {/* Analytics Content */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;