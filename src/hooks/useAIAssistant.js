// hooks/useAIAssistant.js
import { useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useAIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = useCallback(async (questionText, tableName) => {
    if (!questionText.trim() || !tableName) return;

    setLoading(true);
    setError(null);
    setAnswer('');

    try {
      const response = await dashboardService.askQuestion(questionText, tableName);
      if (response.answer) {
        setAnswer(response.answer);
      } else {
        setAnswer('No answer received from AI.');
      }
    } catch (err) {
      setError(err.message || 'Failed to get answer');
      setAnswer('Something went wrong while asking the question.');
      console.error('Error in askQuestion:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAssistant = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setError(null);
  }, []);

  return {
    question,
    setQuestion,
    answer,
    loading,
    error,
    askQuestion,
    resetAssistant,
  };
};