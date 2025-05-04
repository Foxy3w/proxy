import React from 'react';

const DevicesBattery = ({ sensors = [], loading = false, error = null }) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="loading-text">
        Loading sensors data...
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="error-banner">
        Error loading sensors data
      </div>
    );
  }

  // If no data, show empty state
  if (!sensors || sensors.length === 0) {
    return (
      <div className="loading-text">
        No sensors data available
      </div>
    );
  }

  return (
    <div className="sensors-container">
      {/* Sensor content would go here */}
    </div>
  );
};

export default DevicesBattery;