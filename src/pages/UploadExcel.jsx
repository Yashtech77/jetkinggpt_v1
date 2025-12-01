import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { useChatAssistant } from "../hooks/useChatAssistant";
import { MessageSquare, X, Send, Copy, Check, TrendingUp, BotMessageSquare, Sparkle, ArrowDown, Upload } from "lucide-react";

const UploadExcel = ({ isAssistantOpen, setIsAssistantOpen }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(isAssistantOpen || false);

  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [copied, setCopied] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [lastAskedQuestion, setLastAskedQuestion] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = React.useRef(null);

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
    visualization,
    loadingChat,
    chatError,
    askQuestion,
    setAnswer,
  } = useChatAssistant();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    if (chatHistory.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!lastAskedQuestion) return;
    if (!answer && !table && !visualization) return;

    setChatHistory((prev) => {
      const lastIndex = prev.findIndex(
        (item) => item.question === lastAskedQuestion && item.isLoading
      );
      
      if (lastIndex !== -1) {
        const updated = [...prev];
        updated[lastIndex] = {
          question: lastAskedQuestion,
          answer,
          table,
          visualization,
          isLoading: false,
        };
        return updated;
      }
      
      return [
        ...prev,
        {
          question: lastAskedQuestion,
          answer,
          table,
          visualization,
          isLoading: false,
        },
      ];
    });

    setLastAskedQuestion(null);
  }, [answer, table, visualization, lastAskedQuestion]);

  useEffect(() => {
    const storedFileId = localStorage.getItem('uploadedFileId');
    const storedFileName = localStorage.getItem('uploadedFileName');
   
    if (storedFileId && storedFileName) {
      setFileUploaded(true);
      setShowModal(false);
    }
  }, []);
 
  useEffect(() => {
    if (fileId && file) {
      localStorage.setItem('uploadedFileId', fileId);
      localStorage.setItem('uploadedFileName', file.name);
    }
  }, [fileId, file]);
 
  useEffect(() => {
    return () => {
      localStorage.removeItem('uploadedFileId');
      localStorage.removeItem('uploadedFileName');
    };
  }, []);
 
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
    
    const currentFileId = fileId || localStorage.getItem('uploadedFileId');
    
    if (!currentFileId) {
      alert("No file uploaded. Please upload a file first.");
      return;
    }

    setChatHistory((prev) => [
      ...prev,
      {
        question: trimmed,
        answer: null,
        table: null,
        visualization: null,
        isLoading: true,
      },
    ]);

    setLastAskedQuestion(trimmed);
    setAnswer("");
    setQuestion("");

    await askQuestion(trimmed, currentFileId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loadingChat && question.trim()) {
      e.preventDefault();
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
    setIsAIChatOpen((prev) => !prev);
  };

  useEffect(() => {
    if (setIsAssistantOpen) {
      setIsAssistantOpen(isAIChatOpen);
    }
  }, [isAIChatOpen, setIsAssistantOpen]);

  const charts = dashboard?.charts || [];
  const summary = dashboard?.summary || null;
  const insights = dashboard?.insights || [];

  const barCharts = charts.filter((c) => c.type === "bar");
  const pieCharts = charts.filter((c) => c.type === "pie");
  const lineCharts = charts.filter((c) => c.type === "line");
  const horizontalBarCharts = charts.filter(c => c.type === "horizontal_bar" || 
    (c.title && (c.title.toLowerCase().includes("outstanding") || 
    c.title.toLowerCase().includes("paid amount by source"))));
  const tableCharts = charts.filter((c) => c.type === "table");

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

  const normalizeBars = (values, maxHeight = 160) => {
    if (!values || values.length === 0) return [];
    const max = Math.max(...values);
    if (max <= 0) return values.map(() => 10);
    return values.map((v) => (v / max) * maxHeight + 10);
  };

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
          <div key={sectionIdx} className="my-2 sm:my-3">
            {lines.map((line, lineIdx) => {
              const leadingSpaces = line.match(/^(\s*)/)[0].length;
              const indentLevel = Math.floor(leadingSpaces / 2);
              const cleanLine = line.replace(/^[\s]*[-\*•]\s*/, '');
              
              return (
                <div
                  key={lineIdx}
                  className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"
                  style={{ marginLeft: `${indentLevel * 15}px` }}
                >
                  <span className="text-purple-600 font-bold mt-0.5 flex-shrink-0 text-xs sm:text-sm">
                    {indentLevel > 0 ? '◦' : '•'}
                  </span>
                  <span className="flex-1 text-gray-700 text-xs sm:text-sm">
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
          <ol key={sectionIdx} className="space-y-1.5 sm:space-y-2 my-2 sm:my-3 ml-4 sm:ml-5">
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^\d+\.\s*/, '');
              return (
                <li key={lineIdx} className="text-gray-700 list-decimal text-xs sm:text-sm">
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
          <h4 key={sectionIdx} className="font-bold text-gray-900 mt-3 sm:mt-4 mb-1.5 sm:mb-2 text-sm sm:text-base">
            {parseInlineFormatting(headingText)}
          </h4>
        );
      }
      
      return (
        <div key={sectionIdx} className="my-2 sm:my-3">
          {lines.map((line, lineIdx) => (
            <p key={lineIdx} className="text-gray-700 leading-relaxed mb-1.5 sm:mb-2 text-xs sm:text-sm">
              {parseInlineFormatting(line)}
            </p>
          ))}
        </div>
      );
    });
  };

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
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
      @media (max-width: 640px) {
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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

  const renderMiniChart = (chart) => {
    if (!chart || !chart.type) return null;

    // Bar Chart
    if (chart.type === "bar" && chart.data?.labels && chart.data?.values) {
      const heights = normalizeBars(chart.data.values, 80);
      const barWidth = Math.max(30, Math.min(60, 250 / chart.data.labels.length));
      
      return (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200 sm:border-2">
          <h5 className="text-[10px] sm:text-xs font-bold text-gray-800 mb-2 sm:mb-3 truncate">{chart.title || "Bar Chart"}</h5>
          <div className="overflow-x-auto custom-scrollbar">
            <div 
              className="flex items-end justify-start h-24 sm:h-32 gap-1.5 sm:gap-2" 
              style={{ minWidth: `${chart.data.labels.length * barWidth}px` }}
            >
              {chart.data.labels.map((label, idx) => {
                const value = chart.data.values[idx];
                const height = heights[idx];
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center gap-0.5 sm:gap-1"
                    style={{ minWidth: `${barWidth - 8}px` }}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-colors"
                      style={{ height: `${height * 0.8}px`, minHeight: '8px' }}
                      title={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
                    />
                    <span className="text-[8px] sm:text-[9px] text-gray-600 truncate w-full text-center" title={label}>
                      {label.length > 6 ? label.substring(0, 6) + '...' : label}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-purple-700">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Pie Chart
    if (chart.type === "pie" && chart.data?.labels && chart.data?.values) {
      const total = chart.data.values.reduce((sum, val) => sum + val, 0);
      return (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200 sm:border-2">
          <h5 className="text-[10px] sm:text-xs font-bold text-gray-800 mb-2 sm:mb-3 truncate">{chart.title || "Pie Chart"}</h5>
          <div className="space-y-1.5 sm:space-y-2">
            {chart.data.labels.map((label, idx) => {
              const value = chart.data.values[idx];
              const percentage = total > 0 ? (value / total) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-[9px] sm:text-[10px] font-medium text-gray-700 mb-0.5 sm:mb-1">
                    <span className="truncate pr-1 sm:pr-2">{label}</span>
                    <span className="flex-shrink-0">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 sm:h-1.5 rounded-full bg-purple-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Line Chart - Mobile optimized
    if (chart.type === "line" && chart.data?.labels && chart.data?.values) {
      const max = Math.max(...chart.data.values);
      const min = Math.min(...chart.data.values);
      const range = max - min || 1;
      
      const chartWidth = Math.max(280, chart.data.values.length * 15);
      const chartHeight = 140;
      const padding = { left: 35, right: 15, top: 15, bottom: 30 };
      
      const points = chart.data.values.map((value, idx) => {
        const x = padding.left + (idx / (chart.data.values.length - 1)) * (chartWidth - padding.left - padding.right);
        const y = padding.top + (chartHeight - padding.top - padding.bottom) - ((value - min) / range) * (chartHeight - padding.top - padding.bottom);
        return { x, y, value, label: chart.data.labels[idx] };
      });
      
      const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ');
      
      const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

      return (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200 sm:border-2 overflow-hidden mt-2 sm:mt-3">
          <h5 className="text-[10px] sm:text-xs font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
            <span className="text-purple-600 text-sm sm:text-base">📈</span>
            <span className="truncate">{chart.title || "Line Chart"}</span>
          </h5>
          <div className="overflow-x-auto custom-scrollbar" style={{ maxHeight: '180px' }}>
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full"
              style={{ minWidth: `${chartWidth}px`, height: '140px' }}
            >
              {[0, 1, 2, 3].map((i) => {
                const y = padding.top + (i / 3) * (chartHeight - padding.top - padding.bottom);
                const value = max - (i / 3) * range;
                return (
                  <g key={i}>
                    <line 
                      x1={padding.left} 
                      y1={y} 
                      x2={chartWidth - padding.right} 
                      y2={y} 
                      stroke="#f3f4f6" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={padding.left - 3} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="text-[7px] sm:text-[8px] fill-gray-500"
                    >
                      {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </text>
                  </g>
                );
              })}
              
              <path 
                d={areaPath} 
                fill="url(#miniAreaGradient)" 
                opacity="0.2"
              />
              
              <path 
                d={pathData} 
                fill="none" 
                stroke="#7c3aed" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {points.map((p, idx) => {
                const showLabel = idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 4) === 0;
                
                return (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="3" 
                      fill="white"
                      stroke="#7c3aed"
                      strokeWidth="1.5"
                    >
                      <title>{`${p.value.toLocaleString()}`}</title>
                    </circle>
                  </g>
                );
              })}
              
              <line 
                x1={padding.left} 
                y1={padding.top} 
                x2={padding.left} 
                y2={chartHeight - padding.bottom} 
                stroke="#9ca3af" 
                strokeWidth="1"
              />
              <line 
                x1={padding.left} 
                y1={chartHeight - padding.bottom} 
                x2={chartWidth - padding.right} 
                y2={chartHeight - padding.bottom} 
                stroke="#9ca3af" 
                strokeWidth="1"
              />
              
              <defs>
                <linearGradient id="miniAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="flex justify-between mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-purple-100 text-[8px] sm:text-[10px]">
            <div>
              <span className="text-gray-500">Min: </span>
              <span className="font-bold text-purple-700">{min.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Max: </span>
              <span className="font-bold text-purple-700">{max.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Pts: </span>
              <span className="font-bold text-gray-700">{chart.data.values.length}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const ChartContainer = ({ title, children, fullWidth = false }) => (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-purple-100 overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2.5 sm:px-6 sm:py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">{title}</h3>
        </div>
      </div>
      <div className="p-3 sm:p-4 md:p-6">
        {children}
      </div>
    </div>
  );

  const renderVerticalBarChart = (chart, colorIdx = 0) => {
    if (!chart) return null;
    const { title, data } = chart;
    const heights = normalizeBars(data.values, 120);
    const colors = purpleTheme.charts[colorIdx % purpleTheme.charts.length];

    return (
      <ChartContainer title={title}>
        <div className="h-56 sm:h-64 md:h-80 overflow-x-auto overflow-y-visible custom-scrollbar">
          <div className="flex items-end justify-around h-44 sm:h-52 md:h-64 min-w-max px-2 sm:px-4" style={{ minWidth: `${Math.max(data.labels.length * 60, 300)}px` }}>
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const height = heights[idx] * 0.85;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 sm:gap-2 group cursor-pointer"
                  style={{ minWidth: '50px' }}
                >
                  <div className="relative">
                    <div
                      className={`w-8 sm:w-10 md:w-12 rounded-t-lg bg-gradient-to-t ${colors.gradient} group-hover:scale-105 transition-all duration-300 border ${colors.border} shadow-sm sm:shadow-md`}
                      style={{ height: `${height}px`, minHeight: '8px' }}
                    />
                    <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs whitespace-nowrap z-10 shadow-xl">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-xs font-medium text-gray-600 text-center max-w-[60px] sm:max-w-[80px] break-words leading-tight">
                    {label.length > 10 ? label.substring(0, 10) + '...' : label}
                  </span>
                  <span className="text-[9px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
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

  const renderHorizontalBarChart = (chart, colorIdx = 0) => {
    if (!chart) return null;
    const { title, data } = chart;
    const max = Math.max(...data.values);
    const colors = purpleTheme.charts[colorIdx % purpleTheme.charts.length];

    return (
      <ChartContainer title={title}>
        <div className="h-56 sm:h-64 md:h-80 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 sm:pr-2">
          <div className="space-y-2.5 sm:space-y-4">
            {data.labels.map((label, idx) => {
              const value = data.values[idx];
              const percentage = max > 0 ? (value / max) * 100 : 0;
              
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <span className="text-[11px] sm:text-sm font-medium text-gray-700 break-words pr-1.5 sm:pr-2 leading-tight">{label}</span>
                    <span className="text-[11px] sm:text-sm font-bold text-purple-700 whitespace-nowrap">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  </div>
                  <div className="w-full bg-purple-50 rounded-full h-4 sm:h-5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 rounded-full flex items-center justify-end pr-1.5 sm:pr-2 shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-[9px] sm:text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="h-56 sm:h-64 md:h-80 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 flex-shrink-0">
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
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">{total.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 md:max-h-56 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 w-full">
              {slices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full group-hover:scale-125 transition-transform flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-sm font-medium text-gray-700 truncate" title={slice.label}>
                      {slice.label}
                    </p>
                    <p className="text-[9px] sm:text-xs text-gray-500">
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

  const renderLineChart = (chart) => {
    if (!chart) return null;
    const { title, data } = chart;
    
    const max = Math.max(...data.values);
    const min = Math.min(...data.values);
    const range = max - min || 1;
    
    const chartHeight = 200;
    const chartWidth = Math.max(400, data.values.length * 30);
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 15;
    const paddingBottom = 60;
    
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
        <div className="h-56 sm:h-64 md:h-80 overflow-x-auto overflow-y-visible custom-scrollbar">
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
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] sm:text-xs fill-gray-600 font-medium">
                    {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}
            
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={chartHeight - paddingBottom} stroke="#a78bfa" strokeWidth="2" />
            <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="#a78bfa" strokeWidth="2" />
            
            <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${paddingLeft} ${chartHeight - paddingBottom} Z`} fill="url(#areaGradient)" opacity="0.3" />
            
            {points.map((point, idx) => (
              <g key={idx}>
                <circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#7c3aed" strokeWidth="2" className="hover:r-6 transition-all cursor-pointer" />
                <title>{`${formatDateLabel(data.labels[idx])}: ${point.value.toLocaleString()}`}</title>
              </g>
            ))}
            
            {data.labels.map((label, idx) => {
              const skipFactor = Math.ceil(data.labels.length / 8);
              if (idx % skipFactor === 0 || idx === data.labels.length - 1) {
                return (
                  <text
                    key={idx}
                    x={points[idx].x}
                    y={chartHeight - paddingBottom + 20}
                    textAnchor="end"
                    className="text-[9px] sm:text-[11px] fill-gray-600 font-medium"
                    transform={`rotate(-45 ${points[idx].x} ${chartHeight - paddingBottom + 20})`}
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

  const renderSummaryMetrics = () => {
    if (!summary) return null;
    
    const metrics = Object.entries(summary).map(([key, value], idx) => {
      const label = key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      const icon = <TrendingUp size={14} className="text-purple-600 group-hover:text-indigo-700 transition-colors sm:w-[18px] sm:h-[18px]" />;
      
      return (
        <div key={key} className="group bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] sm:hover:-translate-y-1">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <span className="text-lg sm:text-xl md:text-2xl">{icon}</span>
            </div>
            <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-800 mb-1 sm:mb-2 text-center leading-tight">
              {label}
            </h4>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-0.5 sm:mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
      );
    });

    return (
      <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics}
      </div>
    );
  };

  const getStoredFileName = () => {
    return file?.name || localStorage.getItem('uploadedFileName') || 'your file';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Upload Modal - Mobile Optimized */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="sticky top-2 sm:top-4 right-2 sm:right-4 float-right w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center transition-all duration-300 hover:rotate-90 group z-10"
            >
              <span className="text-gray-600 group-hover:text-purple-600 text-xl sm:text-2xl font-light">×</span>
            </button>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-purple-200">
                  <Upload className="text-purple-600" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Upload Excel File
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-4">
                  Choose an Excel file to unlock AI-powered insights and analytics
                </p>
              </div>

              <div className="border-2 border-dashed border-purple-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 group mb-4 sm:mb-6">
                <input
                  type="file"
                  className="hidden"
                  id="excelInput"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <label
                  htmlFor="excelInput"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg sm:rounded-xl cursor-pointer hover:shadow-lg active:scale-95 sm:hover:scale-105 transition-all duration-300 font-semibold text-sm sm:text-base"
                >
                  📁 Choose File
                </label>

                {file && (
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-purple-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-purple-200 max-w-full">
                    <span className="text-purple-600 flex-shrink-0">✓</span>
                    <p className="text-xs sm:text-sm text-purple-700 font-medium truncate">{file.name}</p>
                  </div>
                )}
              </div>

              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-8 sm:px-10 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg active:scale-95 sm:hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {uploading ? "Uploading..." : "⬆️ Upload & Continue"}
                  </button>
                </div>
              )}

              {dashboardError && (
                <p className="mt-3 sm:mt-4 text-center text-xs text-red-500">{dashboardError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Toggle Button - Mobile Optimized */}
      {fileUploaded && !showModal && (
        <button
          onClick={toggleAIChat}
          className="fixed top-3 right-3 sm:top-6 sm:right-6 z-40 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95 sm:hover:scale-110"
          title={isAIChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isAIChatOpen ? <X size={20} /> : <Sparkle size={20} />}
        </button>
      )}

      {/* Sliding AI Chat Panel - Mobile Full Width */}
      {fileUploaded && !showModal && (
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-purple-100 sm:border-l-2 ${
            isAIChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header - Mobile Optimized */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Sparkle size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold truncate">AI Assistant</h3>
                </div>
                <button
                  onClick={toggleAIChat}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              <p className="text-[11px] sm:text-sm text-purple-100 truncate">
                Ask questions about {getStoredFileName()}
              </p>
            </div>

            {/* Chat Content - Mobile Optimized */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 custom-scrollbar relative"
            >
              {chatError && (
                <div className="bg-red-50 border border-red-200 sm:border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <span className="text-red-500 text-base sm:text-xl flex-shrink-0">⚠️</span>
                  <p className="text-red-700 text-xs sm:text-sm">{chatError}</p>
                </div>
              )}

              {/* Suggested Questions - Mobile Optimized */}
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2 sm:mb-3 uppercase tracking-wide">
                  💭 Suggested Questions
                </p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
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
                      className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white font-medium border border-gray-200 sm:border-2 hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat History - Mobile Optimized */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {chatHistory.map((item, idx) => (
                    <div key={idx} className="space-y-2 sm:space-y-3">
                      {/* User question bubble */}
                      <div className="rounded-lg sm:rounded-xl bg-blue-50 border border-blue-200 sm:border-2 p-3 sm:p-4 shadow-sm">
                        <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                          {item.question}
                        </p>
                      </div>

                      {/* Loading state */}
                      {item.isLoading ? (
                        <div className="rounded-lg sm:rounded-xl bg-white border border-gray-200 sm:border-2 p-3 sm:p-4 shadow-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-purple-500 border-t-transparent" />
                            <p className="text-[10px] sm:text-xs text-gray-500">AI is thinking...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* AI answer */}
                          {item.answer && (
                            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 sm:border-2 p-3 sm:p-4 md:p-5 shadow-inner">
                              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="text-base sm:text-lg">🤖</span>
                                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                    AI Response
                                  </h4>
                                </div>

                                {idx === chatHistory.length - 1 && (
                                  <button
                                    onClick={handleCopyResponse}
                                    className="p-1 sm:p-1.5 rounded-lg hover:bg-purple-100 transition-all flex-shrink-0"
                                    title="Copy to clipboard"
                                  >
                                    {copied ? (
                                      <Check size={14} className="text-green-600 sm:w-4 sm:h-4" />
                                    ) : (
                                      <Copy size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {formatAIResponse(item.answer)}
                              </div>
                            </div>
                          )}

                          {/* Visualization */}
                          {item.visualization && (
                            <div className="mt-2">
                              {renderMiniChart(item.visualization)}
                            </div>
                          )}

                          {/* Result table */}
                          {item.table && item.table.type === "dataframe" && (
                            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 sm:border-2 p-3 sm:p-4 shadow-inner">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-purple-100 sm:border-b-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                  <TrendingUp size={14} className="text-white sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800 text-xs sm:text-sm block">
                                    Data Results
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-500">
                                    {item.table.shape?.[0]} rows × {item.table.shape?.[1] || item.table.columns.length} columns
                                  </span>
                                </div>
                              </div>
                              <div className="max-h-52 sm:max-h-64 overflow-auto custom-scrollbar">
                                <table className="min-w-full text-[10px] sm:text-xs border-collapse">
                                  <thead className="sticky top-0 z-10">
                                    <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                                      {item.table.columns.map((col, colIdx) => (
                                        <th
                                          key={colIdx}
                                          className="border border-purple-200 sm:border-2 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap"
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
                                            className="border border-purple-200 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 whitespace-nowrap"
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
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {chatHistory.length === 0 && !loadingChat && !chatError && (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl opacity-50">💬</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 italic">
                    Your AI response will appear here...
                  </p>
                </div>
              )}

              {/* Scroll to Bottom Button */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-16 sm:bottom-20 md:bottom-24 right-3 sm:right-4 md:right-[20rem] z-50 p-2 sm:p-2.5 md:p-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95 sm:hover:scale-110 animate-bounce"
                  title="Scroll to bottom"
                >
                  <ArrowDown size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                </button>
              )}
            </div>

            {/* Input Area - Mobile Optimized */}
            <div className="p-2.5 sm:p-3 md:p-4 border-t border-gray-100 sm:border-t-2 bg-gray-50 flex-shrink-0">
              <div className="flex gap-1.5 sm:gap-2">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your data..."
                  rows={1}
                  disabled={loadingChat}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 sm:focus:ring-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={loadingChat || !question.trim()}
                  className={`self-end px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all transform flex-shrink-0 ${
                    loadingChat || !question.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 active:scale-95 sm:hover:scale-105 shadow-md"
                  }`}
                >
                  {loadingChat ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={16} className="sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 text-center hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Analytics Dashboard - Mobile Optimized */}
      {!showModal && (
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isAIChatOpen ? 'lg:mr-96' : 'mr-0'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-8">
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                Analytics Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                {fileUploaded ? `Analyzing: ${getStoredFileName()}` : "Upload Excel files to explore analytics"}
              </p>
            </div>

            {/* Analytics Content */}
            <section className="space-y-4 sm:space-y-6">
              {loadingDashboard && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-6 sm:p-8 border border-purple-100 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-[3px] sm:border-4 border-purple-200 border-t-purple-600 mb-3 sm:mb-4"></div>
                  <p className="text-xs sm:text-sm text-gray-500">Loading analytics from backend...</p>
                </div>
              )}

              {!loadingDashboard && !dashboard && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-8 sm:p-12 border border-purple-100 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl">📊</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">No analytics available yet. Upload an Excel file to see insights.</p>
                </div>
              )}

              {dashboard && (
                <>
                  {renderSummaryMetrics()}

                  {insights.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border border-purple-200">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-xl sm:text-2xl">💡</span>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1.5 sm:mb-2">Key Insights</h4>
                          <div className="space-y-1.5 sm:space-y-2">
                            {insights.map((insight, idx) => (
                              <p key={idx} className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                • {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                    {barCharts.map((chart, idx) => (
                      <React.Fragment key={`bar-${idx}`}>
                        {renderVerticalBarChart(chart, idx)}
                      </React.Fragment>
                    ))}
                    
                    {pieCharts.map((chart, idx) => (
                      <React.Fragment key={`pie-${idx}`}>
                        {renderPieChart(chart)}
                      </React.Fragment>
                    ))}

                    {horizontalBarCharts.map((chart, idx) => (
                      <React.Fragment key={`hbar-${idx}`}>
                        {renderHorizontalBarChart(chart, idx)}
                      </React.Fragment>
                    ))}
                  </div>

                  {lineCharts.map((chart, idx) => (
                    <React.Fragment key={`line-${idx}`}>
                      {renderLineChart(chart)}
                    </React.Fragment>
                  ))}

                  {tableCharts.length > 0 && (
                    <div className="space-y-4 sm:space-y-6">
                      {tableCharts.map((tableChart, tableIdx) => {
                        const isExecutiveReport = tableChart.category === "executive_report";
                        
                        return (
                          <ChartContainer 
                            key={`table-${tableIdx}`} 
                            title={tableChart.title || "Data Table"}
                            fullWidth={true}
                          >
                            {isExecutiveReport && (
                              <span className="inline-block text-[10px] sm:text-xs text-purple-600 font-semibold bg-purple-50 px-2 sm:px-3 py-1 rounded-full mb-3 sm:mb-4">
                                Executive Report
                              </span>
                            )}
                            <div className="h-56 sm:h-64 md:h-80 overflow-auto custom-scrollbar">
                              <table className="min-w-full text-[10px] sm:text-xs border-collapse">
                                <thead className="sticky top-0 z-10">
                                  <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                                    {tableChart.data.headers.map((h, i) => (
                                      <th
                                        key={i}
                                        className="border border-purple-200 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap"
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
                                        
                                        let cellClass = "border border-gray-200 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 whitespace-nowrap";
                                        
                                        if (isPriority) {
                                          const priorityColors = {
                                            HIGH: "bg-red-100 text-red-800 font-bold",
                                            MEDIUM: "bg-yellow-100 text-yellow-800 font-bold",
                                            LOW: "bg-green-100 text-green-800 font-bold"
                                          };
                                          cellClass += ` ${priorityColors[String(cell).toUpperCase()]}`;
                                        } else if (isStatus) {
                                          cellClass += " text-green-600 font-bold text-center text-base sm:text-lg";
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