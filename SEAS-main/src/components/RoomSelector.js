import React from 'react';

const RoomSelector = ({ 
  rooms = [], 
  selectedRoom, 
  onSelectRoom, 
  loading = false, 
  error = null 
}) => {
  // Default rooms if no data is provided
  const defaultRooms = [
    { id: 'room1', name: 'Room 1' },
    { id: 'room2', name: 'Room 2' },
    { id: 'room3', name: 'Room 3' },
    { id: 'room4', name: 'Room 4' },
  ];
  
  // Make sure rooms is an array before trying to use it
  const roomsArray = Array.isArray(rooms) ? rooms : [];
  
  // Use rooms from props or fallback to default
  const displayRooms = roomsArray.length > 0 ? roomsArray : defaultRooms;
  
  // Handle loading state
  if (loading) {
    return (
      <div className="card">
        <div className="room-grid">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="loading-container loading-pulse" style={{height: '64px'}}></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="card">
        <div className="error-message">
          Error loading rooms: {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="room-grid">
        {displayRooms.map((room) => (
          <button
            key={room.id}
            className={`room-button ${selectedRoom === room.id ? 'active' : ''}`}
            onClick={() => onSelectRoom(room.id)}
          >
            <span>{room.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;