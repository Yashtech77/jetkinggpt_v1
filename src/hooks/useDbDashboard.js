// hooks/useDbDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDbDashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tablesLoading, setTablesLoading] = useState(true);

  // Fetch tables on mount
  useEffect(() => {
    const fetchTables = async () => {
      setTablesLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getTables();
        if (response.success) {
          setTables(response.tables);
        } else {
          setError('Failed to fetch tables');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch tables');
        console.error('Error in fetchTables:', err);
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Generate dashboard
  const generateDashboard = useCallback(async (tableName) => {
    if (!tableName) return;

    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.generateDashboard(tableName);
      if (response.success) {
        setDashboardData(response.dashboard);
        setSelectedTable(tableName);
      } else {
        setError('Failed to generate dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate dashboard');
      console.error('Error in generateDashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset dashboard
  const resetDashboard = useCallback(() => {
    setDashboardData(null);
    setSelectedTable('');
    setError(null);
  }, []);

  return {
    tables,
    selectedTable,
    dashboardData,
    loading,
    error,
    tablesLoading,
    generateDashboard,
    resetDashboard,
    setSelectedTable,
  };
};