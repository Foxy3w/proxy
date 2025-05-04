// This is a service file to handle all data fetching from your database
import axios from 'axios';

// Base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Service functions
const DataService = {
  // Get current metrics (Heat, Electricity, Humidity, CO2)
  getCurrentMetrics: async (roomId) => {
    const res = await axios.get(`${API_BASE_URL}/metrics/current?roomId=${roomId}`);
    return res.data;
  },

  // Send a new metric
  postMetric: async (metric) => {
    const res = await axios.post(`${API_BASE_URL}/metrics`, metric);
    return res.data;
  },

  // Get rooms
  getRooms: async () => {
    try {
      const response = await apiClient.get('/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get temperature data for analysis diagram
  getTemperatureData: async (roomId, period = 'day') => {
    try {
      const response = await apiClient.get(`/temperatures?roomId=${roomId}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      throw error;
    }
  },

  // Get compatibility data
  getCompatibilityData: async (roomId) => {
    try {
      const response = await apiClient.get(`/compatibility?roomId=${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching compatibility data:', error);
      throw error;
    }
  },

  // Get target vs reality data
  getTargetVsReality: async (roomId, days = 7) => {
    try {
      const response = await apiClient.get(`/target-vs-reality?roomId=${roomId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching target vs reality data:', error);
      throw error;
    }
  },

  // Get sensors data
  getSensors: async () => {
    try {
      const response = await apiClient.get('/sensors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors data:', error);
      throw error;
    }
  }
};

export default DataService;