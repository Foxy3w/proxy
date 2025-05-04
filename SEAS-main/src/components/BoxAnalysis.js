// BoxAnalysis.js - Fixed with proper room selection logic
import React, { useState, useEffect, useRef } from 'react';
import { useUnits } from '../context/UnitContext';
import NoDataFallback from './NoDataFallback';
import axios from 'axios';

const BoxAnalysis = ({ 
  metrics = [], 
  loading = false, 
  error = null,
  selectedRoom = '1',
  onRoomSelect,
  onCreateSample
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [metricsPerPage, setMetricsPerPage] = useState(6);
  const containerRef = useRef(null);
  const [roomMetrics, setRoomMetrics] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState({});
  
  // Get all unit context values
  const { units, convertValue, formatValue } = useUnits();
  
  // Fetch all available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        // Fetch rooms from the API
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Format room data for the selector
          const roomsData = response.data.map(room => {
            const roomId = room.room || room.id;
            return {
              id: roomId.toString().replace('room', ''), // Make sure we strip 'room' prefix
              name: room.name || roomId.toString()
            };
          });
          
          // Sort rooms by ID if possible
          roomsData.sort((a, b) => {
            const aNum = parseInt(a.id, 10);
            const bNum = parseInt(b.id, 10);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
            return a.id.localeCompare(b.id);
          });
          
          setAvailableRooms(roomsData);
        } else {
          // Default rooms if no data is returned
          setAvailableRooms([
            { id: '1', name: '1' },
            { id: '2', name: '2' },
            { id: '3', name: '3' },
            { id: '4', name: '4' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        // Fallback to default rooms
        setAvailableRooms([
          { id: '1', name: '1' },
          { id: '2', name: '2' },
          { id: '3', name: '3' },
          { id: '4', name: '4' },
        ]);
      } finally {
        setLoadingRooms(false);
      }
    };
    
    fetchRooms();
    
    // Set up an interval to refresh rooms every 30 seconds
    const interval = setInterval(() => {
      fetchRooms();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Process the raw metrics data to extract values and units
  const processRawMetrics = (rawMetrics) => {
    // Ensure we have a valid array
    if (!Array.isArray(rawMetrics) || rawMetrics.length === 0) {
      return [];  // Return empty array instead of defaults
    }
    
    return rawMetrics.map(metric => {
      // Handle null or undefined metric
      if (!metric) {
        return {
          title: 'Unknown',
          value: 0,
          unit: '',
          color: 'energy',
          numericValue: 0,
          rawValue: 0
        };
      }
      
      // Extract numeric value and unit from the metric
      let numericValue = metric.value;
      let unit = metric.unit || '';
      
      // If value is a string (like "24.5°C"), extract the numeric part and unit
      if (typeof metric.value === 'string') {
        const matches = metric.value.match(/^([\d.]+)\s*([^\d]*)$/);
        if (matches) {
          numericValue = parseFloat(matches[1]);
          
          // If no unit was provided as a property, use the one from the string
          if (!unit && matches[2]) {
            unit = matches[2].trim().toLowerCase()
              .replace('°c', 'celsius')
              .replace('°f', 'fahrenheit')
              .replace('k', 'kelvin')
              .replace('kwh', 'kwh')
              .replace('mwh', 'mwh')
              .replace('j', 'joule')
              .replace('btu', 'btu')
              .replace('hpa', 'hpa')
              .replace('pa', 'pa')
              .replace('psi', 'psi')
              .replace('%', 'percent')
              .replace('lux', 'lux')
              .replace('fc', 'footCandle');
          }
        }
      }
      
      // Ensure color is defined
      const color = metric.color || metric.title?.toLowerCase().replace(' ', '-') || 'energy';
      
      return {
        ...metric,
        numericValue,  // Store the extracted numeric value
        rawValue: metric.value, // Keep the original value
        unit,          // Store the extracted or provided unit
        color
      };
    });
  };
  
  // Fetch metrics for the current room directly
  const fetchRoomMetrics = async (roomId) => {
    // Skip if no roomId or we've already fetched this room's data in the last 10 seconds
    if (!roomId) return;
    
    const now = Date.now();
    if (lastFetchTime[roomId] && now - lastFetchTime[roomId] < 10000) {
      console.log(`Using cached data for room ${roomId}, last fetch was ${(now - lastFetchTime[roomId]) / 1000}s ago`);
      return;
    }
    
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      console.log(`Directly fetching latest reading for room ${roomId}`);
      
      // Make the API call to get the latest reading for this room
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/readings/latest/${roomId}`);
      
      // Update last fetch time for this room
      setLastFetchTime(prev => ({
        ...prev,
        [roomId]: now
      }));
      
      if (response.data) {
        // Convert the reading data to our metrics format
        const reading = response.data;
        
        // Validate and convert the reading data
        // This is crucial - the problem appears to be in the data format inconsistency
        const formattedMetrics = [];
        
        // Energy data
        if (reading.energy !== undefined) {
          formattedMetrics.push({
            title: 'Energy',
            value: reading.energy,
            unit: 'kwh',
            color: 'energy'
          });
        }
        
        // Occupancy - normalize to boolean
        const occupancyValue = 
          reading.occupancy === true || 
          reading.occupancy === 'true' || 
          reading.Occupancy === true || 
          reading.Occupancy === 'true';
        
        formattedMetrics.push({
          title: 'Occupancy',
          value: occupancyValue,
          color: 'occupancy'
        });
        
        // Temperature data
        if (reading.temperature !== undefined) {
          formattedMetrics.push({
            title: 'Temperature',
            value: reading.temperature,
            unit: 'celsius',
            color: 'temperature'
          });
        }
        
        // Humidity data
        if (reading.humidity !== undefined) {
          formattedMetrics.push({
            title: 'Humidity',
            value: reading.humidity,
            unit: 'percent',
            color: 'humidity'
          });
        }
        
        // Light data
        if (reading.light !== undefined) {
          formattedMetrics.push({
            title: 'Light Intensity',
            value: reading.light,
            unit: 'lux',
            color: 'light'
          });
        }
        
        // Pressure data
        if (reading.pressure !== undefined) {
          formattedMetrics.push({
            title: 'Pressure',
            value: reading.pressure,
            unit: 'hpa',
            color: 'pressure'
          });
        }
        
        // CO2 data
        if ((reading.co2 !== undefined) || (reading.CO2 !== undefined)) {
          formattedMetrics.push({
            title: 'CO2',
            value: reading.co2 || reading.CO2,
            unit: 'ppm',
            color: 'co2'
          });
        }
        
        // Process and store these metrics
        const processedMetrics = processRawMetrics(formattedMetrics);
        
        console.log(`Successfully processed metrics for room ${roomId}:`, processedMetrics);
        
        // Set the room metrics - store with normalized room ID 
        setRoomMetrics(prev => ({
          ...prev,
          [roomId]: processedMetrics
        }));
      } else {
        console.warn(`No reading data available for room ${roomId}`);
        // Set empty array for this room's metrics
        setRoomMetrics(prev => ({ ...prev, [roomId]: [] }));
      }
    } catch (err) {
      console.error(`Error fetching metrics for room ${roomId}:`, err);
      // Don't set error state here - just log it
      // We'll still display any cached metrics we have
    } finally {
      setLocalLoading(false);
    }
  };
  
  // When the component loads or selected room changes, fetch metrics directly
  useEffect(() => {
    if (selectedRoom) {
      // Make sure we're using the normalized room ID (without 'room' prefix)
      const normalizedRoomId = selectedRoom.toString().replace('room', '');
      console.log(`Selected room changed to ${normalizedRoomId}, fetching metrics...`);
      fetchRoomMetrics(normalizedRoomId);
    }
  }, [selectedRoom]);
  
  // When new metrics data comes in from props, store it by room ID
  useEffect(() => {
    if (!loading && metrics && Array.isArray(metrics) && metrics.length > 0) {
      const processedMetrics = processRawMetrics(metrics);
      
      // Make sure we're using the normalized room ID
      const normalizedRoomId = selectedRoom.toString().replace('room', '');
      
      setRoomMetrics(prev => ({
        ...prev,
        [normalizedRoomId]: processedMetrics
      }));
      
      // If we have metrics, clear any error state
      setLocalError(null);
    }
  }, [metrics, loading, selectedRoom]);
  
  // For propagating external error state to local state
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  // Get the metrics for the current room
  const getCurrentRoomMetrics = () => {
    // Make sure we're using the normalized room ID
    const normalizedRoomId = selectedRoom.toString().replace('room', '');
    console.log(`Getting metrics for normalized room ID: ${normalizedRoomId}`);
    console.log(`Available room metrics:`, Object.keys(roomMetrics));
    
    return roomMetrics[normalizedRoomId] || [];
  };
  
  // Format metrics with current units for display
  const getFormattedMetrics = () => {
    const currentRoomMetrics = getCurrentRoomMetrics();
    console.log(`Formatting ${currentRoomMetrics.length} metrics for room ${selectedRoom}`);
    
    return currentRoomMetrics.map(metric => {
      try {
        // Special case for occupancy (boolean flag)
        if (metric.title === 'Occupancy') {
          const isOccupied = metric.value === true || metric.value === 'true';
          return {
            ...metric,
            displayValue: isOccupied ? 'Yes' : 'No'
          };
        }
        
        // Get the property name in the format needed for unit conversion
        const property = metric.title.toLowerCase().replace(' ', '');
        
        let displayValue;
        
        // If we have both a numeric value and a unit, convert and format
        if (metric.numericValue !== undefined && metric.unit) {
          // First convert the value to the target unit (important!)
          const convertedValue = convertValue(property, metric.numericValue, metric.unit);
          
          // Then format it with the appropriate unit symbol
          displayValue = formatValue(property, convertedValue);
        } 
        // If we just have a numeric value but no unit, still try to format
        else if (metric.numericValue !== undefined) {
          // For temperature, assume Celsius if no unit
          const assumedUnit = property === 'temperature' ? 'celsius' : '';
          displayValue = formatValue(property, metric.numericValue, assumedUnit);
        }
        // Fallback to the raw value if all else fails
        else {
          displayValue = metric.rawValue || metric.value || '';
        }
        
        return {
          ...metric,
          displayValue
        };
      } catch (e) {
        console.error(`Error formatting metric ${metric.title}:`, e);
        return {
          ...metric,
          displayValue: String(metric.value || '')
        };
      }
    });
  };
  
  // Get formatted metrics for the current room
  const formattedMetrics = getFormattedMetrics();

  // Calculate metrics per page based on container width
  useEffect(() => {
    const calculateMetricsPerPage = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const isMobile = window.innerWidth <= 480;
      const boxWidth = isMobile ? 145 : 135;
      const boxGap = isMobile ? 8 : 12;
      const totalBoxWidth = boxWidth + boxGap;
      
      let boxesThatFit;
      
      if (isMobile) {
        boxesThatFit = 2;
      } else {
        const rawFit = Math.floor((containerWidth + boxGap) / totalBoxWidth);
        const withOneMore = (rawFit + 1) * totalBoxWidth - boxGap;
        const overflow = withOneMore - containerWidth;
        
        if (overflow < boxWidth * 0.25) {
          boxesThatFit = rawFit + 1;
        } else {
          boxesThatFit = rawFit;
        }
        
        if (rawFit >= 3 && boxesThatFit % 2 !== 0 && (boxesThatFit * totalBoxWidth) < containerWidth * 0.9) {
          boxesThatFit = Math.max(2, boxesThatFit - 1);
        }
      }
      
      boxesThatFit = Math.max(1, boxesThatFit);
      
      // Make sure we don't try to show more metrics than we have
      if (formattedMetrics && Array.isArray(formattedMetrics)) {
        boxesThatFit = Math.min(formattedMetrics.length, boxesThatFit);
      }
      
      if (boxesThatFit !== metricsPerPage) {
        setMetricsPerPage(boxesThatFit);
        
        if (formattedMetrics && Array.isArray(formattedMetrics)) {
          const maxPage = Math.ceil(formattedMetrics.length / boxesThatFit) - 1;
          if (currentPage > maxPage) {
            setCurrentPage(Math.max(0, maxPage));
          }
        } else {
          setCurrentPage(0);
        }
      }
    };
    
    calculateMetricsPerPage();
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateMetricsPerPage, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [containerRef, formattedMetrics, currentPage, metricsPerPage]);
  
  // Reset to first page when changing rooms
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedRoom]);
  
  // Get visible metrics for current page - with extra safety checks
  const getVisibleMetrics = () => {
    if (formattedMetrics && Array.isArray(formattedMetrics) && formattedMetrics.length > 0) {
      return formattedMetrics.slice(
        currentPage * metricsPerPage, 
        (currentPage + 1) * metricsPerPage
      );
    }
    return [];
  };
  
  const visibleMetrics = getVisibleMetrics();
  
  // Calculate total pages - with safety check
  const getTotalPages = () => {
    if (formattedMetrics && Array.isArray(formattedMetrics) && formattedMetrics.length > 0) {
      return Math.ceil(formattedMetrics.length / metricsPerPage);
    }
    return 1;
  };
  
  const totalPages = getTotalPages();
  
  // Navigation functions
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  const goToPage = (pageNum) => {
    setCurrentPage(Math.min(Math.max(0, pageNum), totalPages - 1));
  };
  
  // Handle room selection - call parent handler if provided
  const handleRoomSelect = (roomId) => {
    if (onRoomSelect) {
      // Normalize roomId by removing any 'room' prefix
      const normalizedRoomId = roomId.toString().replace('room', '');
      console.log(`User selected room ${normalizedRoomId}`);
      
      // Set loading state and clear error before changing room
      setLocalLoading(true);
      setLocalError(null);
      
      // Reset to first page when changing rooms
      setCurrentPage(0);
      
      // Call parent handler to handle room change with normalized ID
      onRoomSelect(normalizedRoomId);
    }
  };
  
  // Render the room selector with available rooms
  const renderRoomSelector = () => {
    if (loadingRooms) {
      return <div className="room-selector-inline loading-pulse" style={{width: '120px'}}></div>;
    }
    
    // Get the normalized selected room ID
    const normalizedSelectedRoom = selectedRoom.toString().replace('room', '');
    
    return (
      <div className="room-selector-inline">
        Room: {availableRooms.map(room => {
          // Normalize room ID for comparison
          const normalizedRoomId = room.id.toString().replace('room', '');
          
          return (
            <span 
              key={normalizedRoomId}
              className={`room-number ${normalizedSelectedRoom === normalizedRoomId ? 'active' : ''}`}
              onClick={() => handleRoomSelect(normalizedRoomId)}
            >
              {room.name}
            </span>
          );
        })}
      </div>
    );
  };
  
  // Handle initial loading 
  if (localLoading) {
    return (
      <div className="card">
        <div className="header-with-room-selector">
          <h2 className="card-title">Current Data</h2>
          {renderRoomSelector()}
        </div>
        <div className="metrics-container-horizontal" ref={containerRef}>
          {[1, 2].map((_, index) => (
            <div key={index} className="loading-container loading-pulse metric-box-fixed"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Handle no data state
  if (!formattedMetrics || !Array.isArray(formattedMetrics) || formattedMetrics.length === 0) {
    return (
      <div className="card">
        <div className="header-with-room-selector">
          <h2 className="card-title">Current Data</h2>
          {renderRoomSelector()}
        </div>
        <div className="error-message">
          No sensor data available for Room {selectedRoom}
        </div>
        <NoDataFallback 
          message="No sensor readings available in the database for this room."
          onCreateSample={onCreateSample}
        />
      </div>
    );
  }
  
  return (
    <div className={`card ${localLoading ? 'card-loading' : ''}`}>
      <div className="header-with-room-selector">
        <h2 className="card-title">Current Data</h2>
        {renderRoomSelector()}
      </div>
      <div className="metrics-container-horizontal" ref={containerRef}>
        {Array.isArray(visibleMetrics) && visibleMetrics.length > 0 ? (
          visibleMetrics.map((metric, index) => (
            <div 
              key={`${index}-${metric.title}`} 
              className={`metric-box-fixed ${metric.color} ${localLoading ? 'loading-overlay' : ''}`}
            >
              <div className="metric-title">{metric.title}</div>
              <div className="metric-value">{metric.displayValue !== undefined ? metric.displayValue : metric.value}</div>
            </div>
          ))
        ) : (
          // Fallback when no metrics are available
          <div className="empty-metrics-message">No metrics data available</div>
        )}
      </div>
      
      {/* Only show navigation when we have more than one page AND we have metrics */}
      {totalPages > 1 && visibleMetrics && visibleMetrics.length > 0 && (
        <div className="metrics-navigation">
          <button 
            className="metrics-nav-button-horizontal prev"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
          >
            &lt;
          </button>
          <div className="pagination-dots">
            {Array.from({ length: Math.max(1, Math.min(totalPages, 10)) }).map((_, index) => (
              <span 
                key={index} 
                className={`dot ${currentPage === index ? 'active' : ''}`}
                onClick={() => goToPage(index)}
              >
                &nbsp;
              </span>
            ))}
          </div>
          <button 
            className="metrics-nav-button-horizontal next"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default BoxAnalysis;