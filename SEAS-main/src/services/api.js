import axios from 'axios';
import mockData from '../mock/sampleResponses';

// Base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Check if we're in development mode and should use mock data
const USE_MOCK_DATA = true; // Force to true for now

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to simulate API delay in mock mode
const mockDelay = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, 700); // Simulate a 700ms API delay
  });
};

// API services for different data types
export const dashboardService = {
  // Get current metrics data (for colored boxes)
  getCurrentMetrics: async (roomId) => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for metrics');
      return mockDelay(mockData.currentMetrics);
    }
    const response = await apiClient.get(`/metrics/current?roomId=${roomId}`);
    return Array.isArray(response.data) ? response.data : 
           (response.data && response.data.metrics ? response.data.metrics : []);
  },
  
  // Get room list
  getRooms: async () => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for rooms');
      // Make sure it's an array with the right structure
      try {
        if (!mockData || !mockData.rooms) {
          console.error('Mock data or rooms is undefined');
          return [];
        }
        
        const roomsData = mockData.rooms;
        console.log('Mock rooms data:', roomsData);
        
        // Ensure it's an array
        if (!Array.isArray(roomsData)) {
          console.error('Mock rooms data is not an array:', roomsData);
          return [];
        }
        
        return mockDelay(roomsData);
      } catch (error) {
        console.error('Error processing mock room data:', error);
        return mockDelay([]);
      }
    }
    const response = await apiClient.get('/rooms');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  // Get temperature data for the line chart
  getTemperatureData: async (roomId, timeRange = 'day') => {
    if (USE_MOCK_DATA) {
      return mockDelay(mockData.temperature || []);
    }
    const response = await apiClient.get(`/temperature?roomId=${roomId}&timeRange=${timeRange}`);
    return response.data;
  },
  
  // Get target vs reality data
  getTargetComparison: async (roomId, metric = 'heat', days = 7) => {
    if (USE_MOCK_DATA) {
      return mockDelay(mockData.comparison || []);
    }
    const response = await apiClient.get(`/comparison?roomId=${roomId}&metric=${metric}&days=${days}`);
    return response.data;
  },
  
  // Get sensor status data
  getSensorStatus: async () => {
    if (USE_MOCK_DATA) {
      try {
        if (!mockData || !mockData.sensors) {
          console.error('Mock data or sensors is undefined');
          return [];
        }
        
        const sensorsData = mockData.sensors;
        console.log('Mock sensors data:', sensorsData);
        
        // Ensure it's an array
        if (!Array.isArray(sensorsData)) {
          console.error('Mock sensors data is not an array:', sensorsData);
          return [];
        }
        
        return mockDelay(sensorsData);
      } catch (error) {
        console.error('Error processing mock sensor data:', error);
        return mockDelay([]);
      }
    }
    const response = await apiClient.get('/sensors/status');
    return response.data;
  },
  
  // Get compatibility data
  getCompatibilityStatus: async (roomId) => {
    if (USE_MOCK_DATA) {
      return mockDelay(mockData.compatibility || {});
    }
    const response = await apiClient.get(`/compatibility?roomId=${roomId}`);
    return response.data;
  },
  
  // New methods for the Device page
  
  // Add a new room
  addRoom: async (roomData) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Adding room', roomData);
      return mockDelay({ success: true, roomId: `room${Date.now()}` });
    }
    const response = await apiClient.post('/rooms', roomData);
    return response.data;
  },
  
  // Delete a room
  deleteRoom: async (roomId) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Deleting room', roomId);
      return mockDelay({ success: true });
    }
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return response.data;
  },
  
  // Assign sensor to room
  assignSensorToRoom: async (roomId, sensorId) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Assigning sensor', sensorId, 'to room', roomId);
      return mockDelay({ success: true });
    }
    const response = await apiClient.post(`/rooms/${roomId}/sensors`, { sensorId });
    return response.data;
  },
  
  // Unassign sensor from room
  unassignSensorFromRoom: async (roomId, sensorId) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Unassigning sensor', sensorId, 'from room', roomId);
      return mockDelay({ success: true });
    }
    const response = await apiClient.delete(`/rooms/${roomId}/sensors/${sensorId}`);
    return response.data;
  },
  
  // Move sensor between rooms
  moveSensorBetweenRooms: async (fromRoomId, toRoomId, sensorId) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Moving sensor', sensorId, 'from room', fromRoomId, 'to room', toRoomId);
      return mockDelay({ success: true });
    }
    const response = await apiClient.post('/sensors/move', { 
      fromRoomId, 
      toRoomId, 
      sensorId 
    });
    return response.data;
  },
  
  // Get detailed sensor information
  getSensorDetails: async (sensorId) => {
    if (USE_MOCK_DATA) {
      try {
        if (!mockData || !mockData.sensors) {
          console.error('Mock data or sensors is undefined');
          return null;
        }
        
        const sensorsData = mockData.sensors;
        
        // Ensure it's an array
        if (!Array.isArray(sensorsData)) {
          console.error('Mock sensors data is not an array:', sensorsData);
          return null;
        }
        
        const sensor = sensorsData.find(s => s.id === sensorId);
        return mockDelay(sensor || { error: 'Sensor not found' });
      } catch (error) {
        console.error('Error processing mock sensor details:', error);
        return mockDelay(null);
      }
    }
    const response = await apiClient.get(`/sensors/${sensorId}`);
    return response.data;
  }
};

export default {
  dashboard: dashboardService,
};