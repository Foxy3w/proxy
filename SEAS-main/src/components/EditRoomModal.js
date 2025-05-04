// EditRoomModal.js - Updated to handle room names correctly
import React, { useState, useEffect } from 'react';

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

export default EditRoomModal;