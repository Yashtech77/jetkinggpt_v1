// import { useState, useCallback } from 'react';
// import { dashboardService } from '../services/dashboardService';

// export const useAIAssistant = () => {
//   const [question, setQuestion] = useState('');
//   const [answer, setAnswer] = useState('');
//   const [visualization, setVisualization] = useState(null); // ✅ Add visualization state
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const askQuestion = useCallback(async (questionText, tableName) => {
//     if (!questionText.trim() || !tableName) {
//       setError('Please provide both a question and table name');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setAnswer('');
//     setVisualization(null); // ✅ Clear previous visualization

//     try {
//       const response = await dashboardService.askQuestion(questionText, tableName);
      
//       // ✅ Extract the explanation text (the actual AI answer)
//       const aiAnswer = response.explanation || 
//                       response.answer || 
//                       response.message || 
//                       'No response received from AI';
      
//       setAnswer(aiAnswer);
      
//       // ✅ Extract visualization data if it exists
//       if (response.visualization && response.visualization.type) {
//         setVisualization(response.visualization);
//       }
      
//     } catch (err) {
//       const errorMessage = err.message || 'Failed to get answer from AI';
//       setError(errorMessage);
//       console.error('Error in askQuestion:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const resetAssistant = useCallback(() => {
//     setQuestion('');
//     setAnswer('');
//     setVisualization(null); // ✅ Reset visualization
//     setError(null);
//     setLoading(false);
//   }, []);

//   return {
//     question,
//     setQuestion,
//     answer,
//     visualization, // ✅ Export visualization
//     loading,
//     error,
//     askQuestion,
//     resetAssistant,
//   };
// };


import { useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useAIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [resultData, setResultData] = useState(null); // ✅ ADD THIS - for tabular data
  const [visualization, setVisualization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = useCallback(async (questionText, tableName) => {
    if (!questionText.trim() || !tableName) {
      setError('Please provide both a question and table name');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer('');
    setResultData(null); // ✅ Clear previous data
    setVisualization(null);

    try {
      const response = await dashboardService.askQuestion(questionText, tableName);
      
      // ✅ Extract the explanation text (the actual AI answer)
      const aiAnswer = response.explanation || 
                      response.answer || 
                      response.message || 
                      'No response received from AI';
      
      setAnswer(aiAnswer);
      
      // ✅ Extract actual data (records/dataframe)
      if (response.result && response.result.records) {
        setResultData({
          columns: response.result.columns,
          records: response.result.records,
          totalRows: response.result.total_rows || response.result.records.length
        });
      }
      
      // ✅ Extract visualization data if it exists
      if (response.visualization && response.visualization.type) {
        setVisualization(response.visualization);
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to get answer from AI';
      setError(errorMessage);
      console.error('Error in askQuestion:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAssistant = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setResultData(null); // ✅ Reset data
    setVisualization(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    question,
    setQuestion,
    answer,
    resultData, // ✅ Export the actual data
    visualization,
    loading,
    error,
    askQuestion,
    resetAssistant,
  };
};