// Device.js - Completely redesigned without sensor functionality

import React, { useState, useEffect, useCallback } from 'react';
import { roomsService } from './services/roomsApi';
import { dashboardService } from './services/api'; // Import for fallback

// Room card component (internal to Device.js)
const RoomCard = ({ room, onDelete, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Make sure room is a valid object
  if (!room) {
    return (
      <div className="card room-card">
        <div className="error-message">Invalid room data</div>
      </div>
    );
  }
  
  // Calculate room metrics
  const calculateFloorArea = () => {
    if (room.length && room.width) {
      return (room.length * room.width).toFixed(2);
    }
    return 'N/A';
  };
  
  const calculateVolume = () => {
    if (room.length && room.width && room.height) {
      return (room.length * room.width * room.height).toFixed(2);
    }
    return 'N/A';
  };
  
  // Toggle details
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  return (
    <div className="card room-card">
      <div className="room-header">
        <h2 className="room-title">
          Room {room.name || room.id}
          <span className="room-id">ID: {room.id}</span>
        </h2>
        <div className="room-header-actions">
          <button 
            className="toggle-details-button"
            onClick={toggleDetails}
            title={showDetails ? "Hide Details" : "Show Details"}
          >
            <span className="material-icons">
              {showDetails ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          <button 
            className="edit-room-button"
            onClick={() => onEdit && onEdit(room)}
            title="Edit Room"
          >
            <span className="material-icons">edit</span>
          </button>
          <button 
            className="delete-room-button"
            onClick={() => onDelete(room.id)}
            title="Delete Room"
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div className="room-details">
          <div className="room-info-grid">
            <div className="room-info-item">
              <span className="room-info-label">Type:</span>
              <span className="room-info-value">{room.room_type || 'Not specified'}</span>
            </div>
            <div className="room-info-item">
              <span className="room-info-label">Dimensions:</span>
              <span className="room-info-value">
                {room.length || '?'} × {room.width || '?'} × {room.height || '?'} m
              </span>
            </div>
            <div className="room-info-item">
              <span className="room-info-label">Floor Area:</span>
              <span className="room-info-value">{calculateFloorArea()} m²</span>
            </div>
            <div className="room-info-item">
              <span className="room-info-label">Volume:</span>
              <span className="room-info-value">{calculateVolume()} m³</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="room-metrics">
        <div className="room-metric-item">
          <span className="room-metric-label">Area</span>
          <span className="room-metric-value">{calculateFloorArea()} m²</span>
        </div>
        <div className="room-metric-item">
          <span className="room-metric-label">Volume</span>
          <span className="room-metric-value">{calculateVolume()} m³</span>
        </div>
        <div className="room-metric-item">
          <span className="room-metric-label">Type</span>
          <span className="room-metric-value">{room.room_type || 'Unspecified'}</span>
        </div>
      </div>
    </div>
  );
};

// Add Room Modal component (internal to Device.js)
const AddRoomModal = ({ onClose, onAddRoom, nextRoomId }) => {
  const [roomData, setRoomData] = useState({
    name: nextRoomId.toString(), // Default to the next available ID
    room_type: 'Bedroom',
    height: '',
    width: '',
    length: ''
  });
  const [errors, setErrors] = useState({});
  
  const roomTypes = [
    'Bedroom',
    'Living Room',
    'Kitchen',
    'Bathroom',
    'Office/Study'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!roomData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    // Validate dimensions (must be positive numbers)
    const dimensionFields = ['height', 'width', 'length'];
    dimensionFields.forEach(field => {
      const value = parseFloat(roomData[field]);
      if (isNaN(value) || value <= 0) {
        newErrors[field] = `Valid ${field} is required (positive number)`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert dimensions to numbers
    const processedData = {
      ...roomData,
      height: parseFloat(roomData.height),
      width: parseFloat(roomData.width),
      length: parseFloat(roomData.length)
    };
    
    // Call parent handler
    onAddRoom(processedData);
    
    // Reset and close
    setRoomData({
      name: '',
      room_type: 'Bedroom',
      height: '',
      width: '',
      length: ''
    });
    onClose();
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Add New Room</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Room Name/ID</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={roomData.name}
              onChange={handleChange}
              placeholder="Enter room name (e.g., 1, 2, etc.)"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
            <div className="form-help">This will be used as both the room name and ID</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="room_type" className="form-label">Room Type</label>
            <select
              id="room_type"
              name="room_type"
              className="form-select"
              value={roomData.room_type}
              onChange={handleChange}
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group form-group-third">
              <label htmlFor="length" className="form-label">Length (m)</label>
              <input
                type="number"
                id="length"
                name="length"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.length ? 'form-input-error' : ''}`}
                value={roomData.length}
                onChange={handleChange}
                placeholder="e.g., 4"
              />
              {errors.length && <div className="form-error">{errors.length}</div>}
            </div>
            
            <div className="form-group form-group-third">
              <label htmlFor="width" className="form-label">Width (m)</label>
              <input
                type="number"
                id="width"
                name="width"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.width ? 'form-input-error' : ''}`}
                value={roomData.width}
                onChange={handleChange}
                placeholder="e.g., 3"
              />
              {errors.width && <div className="form-error">{errors.width}</div>}
            </div>
            
            <div className="form-group form-group-third">
              <label htmlFor="height" className="form-label">Height (m)</label>
              <input
                type="number"
                id="height"
                name="height"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.height ? 'form-input-error' : ''}`}
                value={roomData.height}
                onChange={handleChange}
                placeholder="e.g., 3"
              />
              {errors.height && <div className="form-error">{errors.height}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <div className="room-preview">
              <div className="room-preview-title">Room Preview</div>
              <div className="room-preview-content">
                <div className="room-preview-detail">
                  <strong>Name/ID:</strong> {roomData.name || 'Not specified'}
                </div>
                <div className="room-preview-detail">
                  <strong>Type:</strong> {roomData.room_type}
                </div>
                <div className="room-preview-detail">
                  <strong>Dimensions:</strong> {roomData.length || '?'} × {roomData.width || '?'} × {roomData.height || '?'} meters
                </div>
                <div className="room-preview-detail">
                  <strong>Volume:</strong> {
                    (!isNaN(parseFloat(roomData.length)) && 
                     !isNaN(parseFloat(roomData.width)) && 
                     !isNaN(parseFloat(roomData.height))) 
                      ? (parseFloat(roomData.length) * parseFloat(roomData.width) * parseFloat(roomData.height)).toFixed(2)
                      : '?'
                  } m³
                </div>
                <div className="room-preview-detail">
                  <strong>Floor Area:</strong> {
                    (!isNaN(parseFloat(roomData.length)) && 
                     !isNaN(parseFloat(roomData.width))) 
                      ? (parseFloat(roomData.length) * parseFloat(roomData.width)).toFixed(2)
                      : '?'
                  } m²
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Room Modal component (internal to Device.js)
const EditRoomModal = ({ room, onClose, onSaveRoom }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    room_type: 'Bedroom',
    height: '',
    width: '',
    length: ''
  });
  const [errors, setErrors] = useState({});
  
  const roomTypes = [
    'Bedroom',
    'Living Room',
    'Kitchen',
    'Bathroom',
    'Office/Study'
  ];
  
  // Initialize form with room data when modal opens
  useEffect(() => {
    if (room) {
      setRoomData({
        name: room.name || room.id || '',
        room_type: room.room_type || 'Bedroom',
        height: room.height !== undefined ? String(room.height) : '',
        width: room.width !== undefined ? String(room.width) : '',
        length: room.length !== undefined ? String(room.length) : '',
      });
    }
  }, [room]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!roomData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    // Validate dimensions (must be positive numbers)
    const dimensionFields = ['height', 'width', 'length'];
    dimensionFields.forEach(field => {
      const value = parseFloat(roomData[field]);
      if (isNaN(value) || value <= 0) {
        newErrors[field] = `Valid ${field} is required (positive number)`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert dimensions to numbers
    const processedData = {
      ...room, // Keep original data like MongoDB ID
      ...roomData,
      height: parseFloat(roomData.height),
      width: parseFloat(roomData.width),
      length: parseFloat(roomData.length)
    };
    
    // Call parent handler
    onSaveRoom(processedData);
    
    // Close modal
    onClose();
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Edit Room {room.name || room.id}</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Room Name/ID</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={roomData.name}
              onChange={handleChange}
              placeholder="Enter room name"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
            <div className="form-help">This will be used as both the room name and ID</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="room_type" className="form-label">Room Type</label>
            <select
              id="room_type"
              name="room_type"
              className="form-select"
              value={roomData.room_type}
              onChange={handleChange}
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group form-group-third">
              <label htmlFor="length" className="form-label">Length (m)</label>
              <input
                type="number"
                id="length"
                name="length"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.length ? 'form-input-error' : ''}`}
                value={roomData.length}
                onChange={handleChange}
                placeholder="e.g., 4"
              />
              {errors.length && <div className="form-error">{errors.length}</div>}
            </div>
            
            <div className="form-group form-group-third">
              <label htmlFor="width" className="form-label">Width (m)</label>
              <input
                type="number"
                id="width"
                name="width"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.width ? 'form-input-error' : ''}`}
                value={roomData.width}
                onChange={handleChange}
                placeholder="e.g., 3"
              />
              {errors.width && <div className="form-error">{errors.width}</div>}
            </div>
            
            <div className="form-group form-group-third">
              <label htmlFor="height" className="form-label">Height (m)</label>
              <input
                type="number"
                id="height"
                name="height"
                step="0.01"
                min="0.1"
                className={`form-input ${errors.height ? 'form-input-error' : ''}`}
                value={roomData.height}
                onChange={handleChange}
                placeholder="e.g., 3"
              />
              {errors.height && <div className="form-error">{errors.height}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <div className="room-preview">
              <div className="room-preview-title">Room Preview</div>
              <div className="room-preview-content">
                <div className="room-preview-detail">
                  <strong>Room ID:</strong> {roomData.name || room.id}
                </div>
                <div className="room-preview-detail">
                  <strong>Name:</strong> {roomData.name || 'Not specified'}
                </div>
                <div className="room-preview-detail">
                  <strong>Type:</strong> {roomData.room_type}
                </div>
                <div className="room-preview-detail">
                  <strong>Dimensions:</strong> {roomData.length || '?'} × {roomData.width || '?'} × {roomData.height || '?'} meters
                </div>
                <div className="room-preview-detail">
                  <strong>Volume:</strong> {
                    (!isNaN(parseFloat(roomData.length)) && 
                     !isNaN(parseFloat(roomData.width)) && 
                     !isNaN(parseFloat(roomData.height))) 
                      ? (parseFloat(roomData.length) * parseFloat(roomData.width) * parseFloat(roomData.height)).toFixed(2)
                      : '?'
                  } m³
                </div>
                <div className="room-preview-detail">
                  <strong>Floor Area:</strong> {
                    (!isNaN(parseFloat(roomData.length)) && 
                     !isNaN(parseFloat(roomData.width))) 
                      ? (parseFloat(roomData.length) * parseFloat(roomData.width)).toFixed(2)
                      : '?'
                  } m²
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Device component
const Device = () => {
  // State for rooms
  const [rooms, setRooms] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Calculate next room ID
  const getNextRoomId = useCallback(() => {
    if (!rooms || rooms.length === 0) return 1;
    
    // Extract numbers from room IDs and find the maximum
    const roomNumbers = rooms
      .map(room => {
        // If room ID is a number, convert directly
        if (!isNaN(parseInt(room.id, 10))) {
          return parseInt(room.id, 10);
        }
        
        // Otherwise try to extract number from "roomX" format
        const match = room.id.match(/room(\d+)/);
        return match ? parseInt(match[1], 10) : parseInt(room.id, 10);
      })
      .filter(num => !isNaN(num));
    
    if (roomNumbers.length === 0) return 1;
    return Math.max(...roomNumbers) + 1;
  }, [rooms]);
  
  // Check if a room with the given ID already exists
  const doesRoomExist = (roomId) => {
    const normalizedId = roomId.toString().replace(/^room/, '');
    
    return rooms.some(room => {
      // Check against both formats: "X" and "roomX"
      const roomIdNormalized = room.id.toString().replace(/^room/, '');
      return roomIdNormalized === normalizedId;
    });
  };
  
  // Fetch rooms data
  useEffect(() => {
    fetchRooms();
    
    // Set up an interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchRooms(false); // Pass false to indicate this is a background refresh
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  const fetchRooms = async (showLoading = true) => {
    try {
      // Only show loading indicators on initial load, not background refreshes
      if (showLoading) {
        setLoading(true);
      }
      
      // Fetch rooms
      let roomsData;
      
      try {
        roomsData = await roomsService.getRooms();
        console.log('Rooms from API:', roomsData);
      } catch (err) {
        console.error('Error from API, using mock data:', err);
        // Fallback to mock data if API fails
        roomsData = await dashboardService.getRooms();
      }
      
      // Process room data to ensure all fields exist
      let processedRooms = Array.isArray(roomsData) ? roomsData.map(room => {
        // Ensure room ID is consistent - if room has a 'room' field, use that as the ID
        let roomId;
        if (room.room) {
          roomId = room.room.toString();
        } else if (room.id) {
          roomId = room.id.toString().replace(/^room/, '');
        } else {
          roomId = getNextRoomId().toString();
        }
        
        return {
          id: roomId,  // Store ID as just the number
          _id: room._id || null, // MongoDB ID
          name: room.name || roomId, // Use ID as name if no name provided
          room_type: room.room_type || 'Bedroom',
          height: room.height || 3,
          width: room.width || 3,
          length: room.length || 4,
          sensors: Array.isArray(room.sensors) ? room.sensors : []
        };
      }) : [];
      
      // Remove duplicate rooms with same ID
      const uniqueRoomsMap = new Map();
      processedRooms.forEach(room => {
        const roomId = room.id.toString();
        
        // If this is a new ID or this room is newer than the existing one, keep this one
        if (!uniqueRoomsMap.has(roomId) || 
            (room.updatedAt && uniqueRoomsMap.get(roomId).updatedAt && 
             new Date(room.updatedAt) > new Date(uniqueRoomsMap.get(roomId).updatedAt))) {
          uniqueRoomsMap.set(roomId, room);
        }
      });
      
      // Convert Map back to array
      processedRooms = Array.from(uniqueRoomsMap.values());
      
      setRooms(processedRooms);
      if (showLoading) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching rooms data:', err);
      if (showLoading) {
        setError('Failed to load rooms data');
        setLoading(false);
      }
    }
  };
  
  // Add a new room
  const handleAddRoom = async (roomData) => {
    try {
      // Get the room ID from the provided data or generate a new one
      const roomId = roomData.name || getNextRoomId().toString();
      
      // Check if a room with this ID already exists
      if (doesRoomExist(roomId)) {
        alert(`A room with ID/name "${roomId}" already exists. Please choose a different name.`);
        return;
      }
      
      const newRoom = {
        ...roomData,
        id: roomId,  // Use the provided name as the ID
        room: roomId, // For server compatibility
        name: roomData.name || roomId, // Use the ID as the name if not provided
        sensors: []
      };
      
      console.log('Adding new room:', newRoom);
      let savedRoom;
      
      try {
        // Send to API
        savedRoom = await roomsService.addRoom(newRoom);
        console.log('Room saved to database:', savedRoom);
      } catch (err) {
        console.error('Error saving room to API:', err);
        savedRoom = newRoom;
      }
      
      // Update rooms state
      setRooms([...rooms, savedRoom]);
      setShowAddRoomModal(false);
      
      // Refresh data to ensure we have the latest from the server
      fetchRooms(false);
    } catch (err) {
      console.error('Error adding room:', err);
    }
  };
  
  // Edit existing room
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowEditRoomModal(true);
  };
  
  // Save edited room
  const handleSaveRoom = async (updatedRoom) => {
    try {
      // Check if the name change would cause a conflict with another room
      if (updatedRoom.name !== selectedRoom.name && doesRoomExist(updatedRoom.name)) {
        alert(`A room with ID/name "${updatedRoom.name}" already exists. Please choose a different name.`);
        return;
      }
      
      // Prepare the updated room data
      const roomToUpdate = {
        ...updatedRoom,
        id: updatedRoom.name, // Update the ID to match the new name
        room: updatedRoom.name, // For server compatibility
      };
      
      // Try to update in the database
      if (roomToUpdate._id) {
        try {
          const savedRoom = await roomsService.updateRoom(roomToUpdate._id, roomToUpdate);
          console.log('Room updated in database:', savedRoom);
          
          // Update with the server response
          setRooms(rooms.map(room => 
            room._id === roomToUpdate._id ? savedRoom : room
          ));
        } catch (err) {
          console.error('Error updating room in API:', err);
          // Still update the local state even if API fails
          setRooms(rooms.map(room => 
            room.id === selectedRoom.id ? roomToUpdate : room
          ));
        }
      } else {
        // No MongoDB ID, just update local state
        setRooms(rooms.map(room => 
          room.id === selectedRoom.id ? roomToUpdate : room
        ));
      }
      
      setShowEditRoomModal(false);
      setSelectedRoom(null);
      
      // Refresh data to ensure we have the latest from the server
      fetchRooms(false);
    } catch (err) {
      console.error('Error saving room:', err);
    }
  };
  
  // Delete room
  const handleDeleteRoom = async (roomId) => {
    try {
      // Find the room
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;
      
      // Show confirmation dialog
      if (!window.confirm(`Are you sure you want to delete Room ${room.name}?`)) {
        return;
      }
      
      // Try to delete from database if we have MongoDB ID
      if (room._id) {
        try {
          await roomsService.deleteRoom(room._id);
          console.log(`Room ${roomId} deleted from database`);
        } catch (err) {
          console.error('Error deleting room from API:', err);
        }
      }
      
      // Remove the room from state
      setRooms(rooms.filter(r => r.id !== roomId));
      
      // Refresh data to ensure we have the latest from the server
      fetchRooms(false);
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  // Sort rooms by ID
  const sortedRooms = [...rooms].sort((a, b) => {
    // Try to convert to numbers if possible
    const aNum = parseInt(a.id, 10);
    const bNum = parseInt(b.id, 10);
    
    // If both are valid numbers, sort numerically
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    
    // Otherwise fall back to string comparison
    return a.id.toString().localeCompare(b.id.toString());
  });
  return (
    <div className="device-page">
      <div className="page-header">
        <h1 className="page-title">Room Management</h1>
        <button 
          className="add-room-button"
          onClick={() => setShowAddRoomModal(true)}
        >
          Add Room
        </button>
      </div>
      
      {loading && (
        <div className="loading-text">Loading rooms data...</div>
      )}
      
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      
      {/* Room stats summary */}
      {!loading && !error && (
        <div className="room-stats-summary">
          <div className="room-stat-card">
            <div className="stat-value">{rooms.length}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
          
          <div className="room-stat-card">
            <div className="stat-value">
              {rooms.reduce((total, room) => {
                const area = room.length * room.width;
                return total + (isNaN(area) ? 0 : area);
              }, 0).toFixed(2)} m²
            </div>
            <div className="stat-label">Total Floor Area</div>
          </div>
          
          <div className="room-stat-card">
            <div className="stat-value">
              {rooms.reduce((total, room) => {
                const volume = room.length * room.width * room.height;
                return total + (isNaN(volume) ? 0 : volume);
              }, 0).toFixed(2)} m³
            </div>
            <div className="stat-label">Total Volume</div>
          </div>
        </div>
      )}
      
      {/* Rooms Grid */}
      <div className="rooms-grid">
        {sortedRooms.length > 0 ? (
          sortedRooms.map(room => (
            <RoomCard 
              key={room.id}
              room={room}
              onDelete={handleDeleteRoom}
              onEdit={handleEditRoom}
            />
          ))
        ) : !loading ? (
          <div className="card empty-rooms-message">
            <div className="empty-state-message">
              <span className="material-icons" style={{ fontSize: '48px', marginBottom: '16px', color: '#9ca3af' }}>
                home
              </span>
              <p>No rooms available.</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                Click "Add Room" to create a new room.
              </p>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Add Room Modal */}
      {showAddRoomModal && (
        <AddRoomModal 
          onClose={() => setShowAddRoomModal(false)}
          onAddRoom={handleAddRoom}
          nextRoomId={getNextRoomId()}
        />
      )}
      
      {/* Edit Room Modal */}
      {showEditRoomModal && selectedRoom && (
        <EditRoomModal 
          room={selectedRoom}
          onClose={() => {
            setShowEditRoomModal(false);
            setSelectedRoom(null);
          }}
          onSaveRoom={handleSaveRoom}
        />
      )}
    </div>
  );
};

export default Device;