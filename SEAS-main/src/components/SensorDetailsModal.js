import React from 'react';

const SensorDetailsModal = ({ sensor, onClose }) => {
  // Helper to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Helper to format battery level
  const getBatteryStatus = (level) => {
    if (level > 75) return 'Excellent';
    if (level > 50) return 'Good';
    if (level > 20) return 'Low';
    return 'Critical';
  };
  
  // Mock data for the sensor details
  // In a real app, this would come from the API
  const sensorDetails = {
    type: 'Temperature & Humidity',
    manufacturer: 'SensorTech Ltd.',
    model: 'EcoSense X2',
    firmwareVersion: '2.3.5',
    lastCalibration: '2024-10-15T08:30:00Z',
    installDate: '2023-12-01T10:15:00Z',
    lastReading: {
      temperature: '24.5°C',
      humidity: '65%',
      timestamp: '2025-04-21T07:32:45Z'
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container sensor-details-modal">
        <div className="modal-header">
          <h2 className="modal-title">Sensor Details {sensor.id.replace('sensor', '#')}</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="sensor-details-content">
          <div className="sensor-status-section">
            <div className="sensor-status-card">
              <div className="status-icon">
                <span className={`material-icons ${sensor.connected ? 'status-connected' : 'status-disconnected'}`}>
                  {sensor.connected ? 'wifi' : 'wifi_off'}
                </span>
              </div>
              <div className="status-label">Connection</div>
              <div className="status-value">{sensor.connected ? 'Connected' : 'Disconnected'}</div>
            </div>
            
            <div className="sensor-status-card">
              <div className="status-icon">
                <span className={`material-icons ${sensor.batteryLevel > 20 ? 'status-good' : 'status-critical'}`}>
                  {sensor.batteryLevel > 75 ? 'battery_full' : 
                   sensor.batteryLevel > 50 ? 'battery_std' : 
                   sensor.batteryLevel > 20 ? 'battery_low' : 'battery_alert'}
                </span>
              </div>
              <div className="status-label">Battery</div>
              <div className="status-value">{sensor.batteryLevel}% ({getBatteryStatus(sensor.batteryLevel)})</div>
            </div>
          </div>
          
          <div className="sensor-info-section">
            <h3 className="section-title">Device Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Sensor Type</div>
                <div className="info-value">{sensorDetails.type}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Manufacturer</div>
                <div className="info-value">{sensorDetails.manufacturer}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Model</div>
                <div className="info-value">{sensorDetails.model}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Firmware Version</div>
                <div className="info-value">{sensorDetails.firmwareVersion}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Installation Date</div>
                <div className="info-value">{formatTimestamp(sensorDetails.installDate)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Last Calibration</div>
                <div className="info-value">{formatTimestamp(sensorDetails.lastCalibration)}</div>
              </div>
            </div>
          </div>
          
          <div className="sensor-readings-section">
            <h3 className="section-title">Latest Readings</h3>
            <div className="readings-grid">
              <div className="reading-item">
                <div className="reading-label">Temperature</div>
                <div className="reading-value">{sensorDetails.lastReading.temperature}</div>
              </div>
              <div className="reading-item">
                <div className="reading-label">Humidity</div>
                <div className="reading-value">{sensorDetails.lastReading.humidity}</div>
              </div>
              <div className="reading-item">
                <div className="reading-label">Timestamp</div>
                <div className="reading-value">{formatTimestamp(sensorDetails.lastReading.timestamp)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="button-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorDetailsModal;