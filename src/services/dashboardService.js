// services/dashboardService.js
const API_BASE_URL = 'https://jetlytics.tjdem.online/api/db';

export const dashboardService = {
  // Fetch all available tables
  async getTables() {
    try {
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  // Generate dashboard for a specific table
  async generateDashboard(tableName) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table_name: tableName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating dashboard:', error);
      throw error;
    }
  },

  // Ask AI assistant question
async askQuestion(message, tableName) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        table_name: tableName,
        message: message
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
}

};