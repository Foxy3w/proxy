// services/readingsApi.js
import axios from 'axios';

// Base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const readingsService = {
  // Get latest reading for a room
  getLatestReading: async (roomId) => {
    try {
      const response = await apiClient.get(`/readings/latest/${roomId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching latest reading for room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Get historical readings for a room
  getReadingsHistory: async (roomId, metric, limit = 12) => {
    try {
      const response = await apiClient.get(`/readings/history/${roomId}`, {
        params: { metric, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reading history for room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Add a new reading
  addReading: async (reading) => {
    try {
      const response = await apiClient.post('/readings', reading);
      return response.data;
    } catch (error) {
      console.error('Error adding reading:', error);
      throw error;
    }
  }
};

export default readingsService;