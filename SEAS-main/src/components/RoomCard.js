// RoomCard.js - Updated to display correct room name and ID
import React, { useState } from 'react';

const RoomCard = ({ 
  room, 
  onDelete, 
  onDragOver, 
  onDrop, 
  onDragStart,
  onSensorClick,
  onEditRoom
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Make sure room is a valid object
  if (!room) {
    return (
      <div className="card room-card">
        <div className="error-message">
          Invalid room data
        </div>
      </div>
    );
  }

  // Ensure sensors is an array
  const sensors = Array.isArray(room.sensors) ? room.sensors : [];
  
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
    <div 
      className="card room-card"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
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
            onClick={() => onEditRoom && onEditRoom(room)}
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
      
      <div className="room-sensors">
        <div className="sensors-count">
          {sensors.length} Sensors
        </div>
        
        <div className="sensors-grid">
          {sensors.length > 0 ? (
            sensors.map(sensor => (
              <div 
                key={sensor.id}
                className="sensor-item"
                draggable
                onDragStart={(e) => onDragStart(e, room.id, sensor.id)}
                onClick={() => onSensorClick(sensor)}
              >
                <div className="sensor-device">
                  <span className="sensor-icon">{sensor.id.replace('sensor', '#')}</span>
                </div>
                <div className={`battery-indicator ${sensor.batteryLevel > 20 ? 'battery-good' : 'battery-low'}`}></div>
                <div className="wifi-icon">
                  {sensor.connected ? (
                    <span className="material-icons connected">wifi</span>
                  ) : (
                    <span className="material-icons disconnected">wifi_off</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-sensors-message">
              No sensors assigned to this room
            </div>
          )}
        </div>
      </div>
      
      <div className="drag-instructions">
        Drag sensors here to assign to this room
      </div>
    </div>
  );
};

export default RoomCard;