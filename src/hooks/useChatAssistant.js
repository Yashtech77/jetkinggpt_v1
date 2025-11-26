//  import { useState } from "react";
// import { chatWithAssistantApi } from "../services/api";
 
// export const useChatAssistant = () => {
//   const [answer, setAnswer] = useState("");      // explanation text
//   const [table, setTable] = useState(null);      // dataframe for UI
//   const [loadingChat, setLoadingChat] = useState(false);
//   const [chatError, setChatError] = useState(null);
 
//   const askQuestion = async (question, fileId) => {
//     if (!question.trim()) return;
 
//     setLoadingChat(true);
//     setChatError(null);
//     setAnswer("");
//     setTable(null);
 
//     try {
//       const data = await chatWithAssistantApi(question, fileId);
 
//       // API shape:
//       // { success, message, code, result: {...}, explanation, visualization }
//       const explanation =
//         data.explanation ||
//         data.answer ||       // fallback if you ever send "answer"
//         data.message ||
//         "No explanation returned from AI.";
 
//       setAnswer(explanation);
 
//       const r = data.result;
 
//       if (r && (r.type === "dataframe" || r.columns)) {
//         const columns = r.columns || [];
//         const shape   = r.shape;
//         const totalRows = r.total_rows;
 
//         // Backend may send "records" (array of objects) or "rows" (2D array)
//         let rows = r.rows;
 
//         if (!rows && Array.isArray(r.records)) {
//           // Convert [{col: val, ...}, ...] → [[val, ...], ...] in column order
//           rows = r.records.map(recordObj =>
//             columns.map(col => recordObj[col])
//           );
//         }
 
//         // Final normalized structure that UploadExcel.jsx expects
//         const normalized = {
//           type: "dataframe",
//           columns,
//           rows: rows || [],
//           shape,
//           total_rows: totalRows,
//         };
 
//         setTable(normalized);
//       } else {
//         setTable(null);
//       }
 
//       return data; // optional: in case caller needs raw data
//     } catch (err) {
//       console.error("Chat error:", err);
//       setChatError(
//         err.message || "Something went wrong while asking the question."
//       );
//       setAnswer("Something went wrong while asking the question.");
//       setTable(null);
//     } finally {
//       setLoadingChat(false);
//     }
//   };
 
//   return {
//     answer,
//     table,          // used in UI as table.columns / table.rows
//     loadingChat,
//     chatError,
//     askQuestion,
//     setAnswer,
//     setTable,
//   };
// };


import { useState } from "react";
import { chatWithAssistantApi } from "../services/api";
 
export const useChatAssistant = () => {
  const [answer, setAnswer] = useState("");      // explanation text
  const [table, setTable] = useState(null);      // dataframe for UI
  const [visualization, setVisualization] = useState(null); // ✅ ADD THIS - for charts
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
 
  const askQuestion = async (question, fileId) => {
    if (!question.trim()) return;
 
    setLoadingChat(true);
    setChatError(null);
    setAnswer("");
    setTable(null);
    setVisualization(null); // ✅ ADD THIS - clear previous visualization
 
    try {
      const data = await chatWithAssistantApi(question, fileId);
 
      // API shape:
      // { success, message, code, result: {...}, explanation, visualization }
      const explanation =
        data.explanation ||
        data.answer ||       // fallback if you ever send "answer"
        data.message ||
        "No explanation returned from AI.";
 
      setAnswer(explanation);

      // ✅ ADD THIS - Extract visualization if present
      if (data.visualization) {
        setVisualization(data.visualization);
      }
 
      const r = data.result;
 
      if (r && (r.type === "dataframe" || r.columns)) {
        const columns = r.columns || [];
        const shape   = r.shape;
        const totalRows = r.total_rows;
 
        // Backend may send "records" (array of objects) or "rows" (2D array)
        let rows = r.rows;
 
        if (!rows && Array.isArray(r.records)) {
          // Convert [{col: val, ...}, ...] → [[val, ...], ...] in column order
          rows = r.records.map(recordObj =>
            columns.map(col => recordObj[col])
          );
        }
 
        // Final normalized structure that UploadExcel.jsx expects
        const normalized = {
          type: "dataframe",
          columns,
          rows: rows || [],
          shape,
          total_rows: totalRows,
        };
 
        setTable(normalized);
      } else {
        setTable(null);
      }
 
      return data; // optional: in case caller needs raw data
    } catch (err) {
      console.error("Chat error:", err);
      setChatError(
        err.message || "Something went wrong while asking the question."
      );
      setAnswer("Something went wrong while asking the question.");
      setTable(null);
      setVisualization(null); // ✅ ADD THIS
    } finally {
      setLoadingChat(false);
    }
  };
 
  return {
    answer,
    table,          // used in UI as table.columns / table.rows
    visualization,  // ✅ ADD THIS - return visualization to component
    loadingChat,
    chatError,
    askQuestion,
    setAnswer,
    setTable,
  };
};