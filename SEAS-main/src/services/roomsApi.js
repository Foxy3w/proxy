// services/roomsApi.js
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

export const roomsService = {
  // Get all rooms
  getRooms: async () => {
    try {
      const response = await apiClient.get('/rooms');
      
      // Format rooms to match the expected structure
      const formattedRooms = response.data.map(room => ({
        id: room.room || room.id,
        name: room.room || '',
        _id: room._id,
        room_type: room.room_type || 'Bedroom',
        height: room.height || 3,
        width: room.width || 3,
        length: room.length || 4,
        sensors: room.sensors || []
      }));
      
      return formattedRooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },
  
  // Get a specific room
  getRoom: async (roomId) => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      
      // Format room to match the expected structure
      const formattedRoom = {
        id: response.data.room || response.data.id,
        name: response.data.room || '',
        _id: response.data._id,
        room_type: response.data.room_type || 'Bedroom',
        height: response.data.height || 3,
        width: response.data.width || 3,
        length: response.data.length || 4,
        sensors: response.data.sensors || []
      };
      
      return formattedRoom;
    } catch (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Add a new room
// roomsApi.js - Update the addRoom and updateRoom methods

// Add a new room
addRoom: async (roomData) => {
  try {
    // Convert from frontend format to backend format
    const backendFormat = {
      room: roomData.id.toString(), // Just use the ID as is - no need to strip "room" prefix
      room_type: roomData.room_type,
      height: roomData.height,
      width: roomData.width,
      length: roomData.length,
      sensors: roomData.sensors || []
    };
    
    const response = await apiClient.post('/rooms', backendFormat);
    
    // Convert back to frontend format
    const frontendFormat = {
      id: response.data.room || response.data.id || roomData.id, // Prioritize room over id
      name: response.data.name || response.data.room || roomData.id, // Name falls back to room ID
      _id: response.data._id,
      room_type: response.data.room_type,
      height: response.data.height,
      width: response.data.width,
      length: response.data.length,
      sensors: response.data.sensors || []
    };
    
    return frontendFormat;
  } catch (error) {
    console.error('Error adding room:', error);
    throw error;
  }
},

// Update a room
updateRoom: async (roomId, roomData) => {
  try {
    // Convert from frontend format to backend format
    const backendFormat = {
      room: roomData.id.toString(), // Use the name as the room ID
      room_type: roomData.room_type,
      height: roomData.height,
      width: roomData.width,
      length: roomData.length,
      sensors: roomData.sensors || []
    };
    
    const response = await apiClient.put(`/rooms/${roomId}`, backendFormat);
    
    // Convert back to frontend format
    const frontendFormat = {
      id: response.data.room || response.data.id || roomData.id,
      name: response.data.name || response.data.room || roomData.id,
      _id: response.data._id,
      room_type: response.data.room_type,
      height: response.data.height,
      width: response.data.width,
      length: response.data.length,
      sensors: response.data.sensors || []
    };
    
    return frontendFormat;
  } catch (error) {
    console.error(`Error updating room ${roomId}:`, error);
    throw error;
  }
},
  
  // Delete a room
  deleteRoom: async (roomId) => {
    try {
      const response = await apiClient.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Get all sensors
  getSensors: async () => {
    try {
      const response = await apiClient.get('/sensors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors:', error);
      throw error;
    }
  }
};

export default roomsService;