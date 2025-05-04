import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import axios from 'axios';
import { useUnits } from '../context/UnitContext'; // Import Units Context

// Room type limits for comparison
const ROOM_TYPE_LIMITS = {
  "Bedroom": { "temp": [22, 26], "co2": 1000, "light": [100, 300] },
  "Living Room": { "temp": [23, 27], "co2": 1000, "light": [150, 500] },
  "Kitchen": { "temp": [null, 32], "co2": 1200, "light": [null, null] },
  "Bathroom": { "temp": [22, 26], "co2": 1200, "light": [50, 200] },
  "Office/Study": { "temp": [22, 25], "co2": 800, "light": [300, 750] }
};

// Baseline energy per cubic meter
const BASELINE_KWH_PER_M3 = { 
  "Bedroom": 0.20, 
  "Living Room": 0.28, 
  "Kitchen": 0.50, 
  "Bathroom": 0.17, 
  "Office/Study": 0.50 
};

// Flag descriptions for room quality
const FLAG_DESCRIPTIONS = {
  "temp_low": "Temperature is below recommended range",
  "temp_high": "Temperature is above recommended range",
  "humid_low": "Humidity is too low for comfort",
  "humid_high": "Humidity is too high, may cause moisture issues",
  "co2_high": "CO2 levels are elevated",
  "energy_high": "Energy consumption is above normal",
  "light_low": "Light levels are too low",
  "light_high": "Light levels are too bright",
  "over_goal": "Usage exceeds target goal",
  "occupancy_mismatch": "Room is occupied but systems are inactive"
};

// Flag icons for visualization
const FLAG_ICONS = {
  "temp_low": "❄️",
  "temp_high": "🔥",
  "humid_low": "🏜️",
  "humid_high": "💧",
  "co2_high": "☁️",
  "energy_high": "⚡",
  "light_low": "🌑",
  "light_high": "☀️",
  "over_goal": "📈",
  "occupancy_mismatch": "👤"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            color: entry.color, 
            margin: '5px 0',
            display: 'flex',
            justifyContent: 'space-between',
            width: '180px'
          }}>
            <span>{`${entry.name}:`}</span>
            <span style={{ fontWeight: 'bold' }}>{`${entry.value.toFixed(2)}${entry.unit || ''}`}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const TargetVsReality = ({ selectedRoom }) => {
  // Get units context
  const { formatValue, convertValue, units } = useUnits();
  
  const [roomInfo, setRoomInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [chartType, setChartType] = useState('horizontal'); // horizontal or vertical

  // Reset state when room changes to force re-rendering
  useEffect(() => {
    console.log(`Room changed to: ${selectedRoom}`);
    setRoomInfo(null);
    setDailySummary(null);
    setLoading(true);
    setError(null);
    setDataExists(false);
  }, [selectedRoom]);

  // Fetch room info when room changes
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Normalize room ID
        const roomId = selectedRoom.toString().replace('room', '');
        console.log(`Fetching info for normalized room ID: ${roomId}`);
        
        // Get room details
        const roomResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`);
        
        // Find the selected room
        const room = roomResponse.data.find(r => {
          const rId = r.id?.toString().replace('room', '') || '';
          const rRoom = r.room?.toString() || '';
          return rId === roomId || rRoom === roomId;
        });
        
        if (!room) {
          console.error(`Room ${roomId} not found in API response`);
          setError(`Room ${roomId} not found`);
          setLoading(false);
          return;
        }
        
        console.log('Found room info:', room);
        setRoomInfo(room);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetching room info:', err);
        setError('Failed to load room data');
        setLoading(false);
      }
    };
    
    fetchRoomInfo();
  }, [selectedRoom]);

  // Fetch daily summary when date or room changes
  useEffect(() => {
    const fetchDailySummary = async () => {
      if (!selectedDate || !roomInfo) return;
      
      try {
        setDateLoading(true);
        setDataExists(false);
        
        // Check if selected date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of today
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0); // Reset to start of selected date
        
        if (selectedDateObj > today) {
          console.warn('Selected date is in the future, no data can exist');
          setDailySummary(null);
          setDataExists(false);
          setDateLoading(false);
          return;
        }
        
        // Normalize room ID
        const roomId = selectedRoom.toString().replace('room', '');
        
        // Get data from API
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/daily_summary/${roomId}/${selectedDate}`
        );
        
        // Check if the response contains actual data fields
        // Look for essential properties that should exist in real data
        if (response.data && 
            (response.data.avg_temperature !== undefined || 
             response.data.max_CO2 !== undefined || 
             response.data.avg_light !== undefined || 
             response.data.daily_energy_kwh !== undefined)) {
          setDailySummary(response.data);
          setDataExists(true);
          console.log('Daily summary found:', response.data);
        } else {
          // No real data available
          setDailySummary(null);
          setDataExists(false);
          console.warn('No valid data available for the selected date');
        }
      } catch (err) {
        console.error('Error fetching daily summary:', err);
        setDailySummary(null);
        setDataExists(false);
      } finally {
        setDateLoading(false);
      }
    };
    
    if (roomInfo) {
      fetchDailySummary();
    }
  }, [selectedDate, roomInfo, selectedRoom]);

  // Calculate comparison data based on daily summary and room type
  const getComparisonData = () => {
    if (!roomInfo || !dailySummary || !dataExists) {
      return [];
    }

    const roomType = roomInfo.room_type || 'Bedroom'; // Default to Bedroom if not specified
    const limits = ROOM_TYPE_LIMITS[roomType] || ROOM_TYPE_LIMITS['Bedroom'];
    
    // Calculate room volume
    const roomVolume = (roomInfo.length || 4) * (roomInfo.width || 3) * (roomInfo.height || 3);
    
    // Calculate target energy based on room volume
    const targetEnergy = (BASELINE_KWH_PER_M3[roomType] || 0.2) * roomVolume;
    
    // Temperature comparison
    const tempData = {
      category: 'Temperature',
      current: dailySummary.avg_temperature || 0,
      target: limits.temp[0] !== null ? (limits.temp[0] + limits.temp[1]) / 2 : limits.temp[1] || 24,
      min: limits.temp[0] || null,
      max: limits.temp[1] || null,
      unit: 'celsius', // Base unit
      status: getStatusForMetric('Temperature', dailySummary.avg_temperature || 0)
    };
    
    // CO2 comparison
    const co2Data = {
      category: 'CO2',
      current: dailySummary.max_CO2 || 0,
      target: limits.co2 / 2, // Half of the maximum limit as target
      max: limits.co2,
      unit: 'ppm', // Base unit
      status: getStatusForMetric('CO2', dailySummary.max_CO2 || 0)
    };
    
    // Light comparison
    const lightData = {
      category: 'Light',
      current: dailySummary.avg_light || 0,
      target: limits.light[0] !== null ? (limits.light[0] + limits.light[1]) / 2 : (limits.light[1] || 300) / 2,
      min: limits.light[0] || null,
      max: limits.light[1] || null,
      unit: 'lux', // Base unit
      status: getStatusForMetric('Light', dailySummary.avg_light || 0)
    };
    
    // Energy comparison
    const energyData = {
      category: 'Energy',
      current: dailySummary.daily_energy_kwh || 0,
      target: targetEnergy,
      unit: 'kwh', // Base unit
      status: getStatusForMetric('Energy', dailySummary.daily_energy_kwh || 0)
    };
    
    return [tempData, co2Data, lightData, energyData];
  };
  
  // Get status (good, warning, bad) for each metric
  const getStatusForMetric = (category, value) => {
    if (!roomInfo) return 'neutral';
    
    const roomType = roomInfo.room_type || 'Bedroom';
    const limits = ROOM_TYPE_LIMITS[roomType] || ROOM_TYPE_LIMITS['Bedroom'];
    
    switch (category) {
      case 'Temperature':
        if (limits.temp[0] !== null && value < limits.temp[0]) return 'bad';
        if (limits.temp[1] !== null && value > limits.temp[1]) return 'bad';
        if (limits.temp[0] !== null && value < limits.temp[0] + 1) return 'warning';
        if (limits.temp[1] !== null && value > limits.temp[1] - 1) return 'warning';
        return 'good';
      case 'CO2':
        if (value > limits.co2) return 'bad';
        if (value > limits.co2 * 0.8) return 'warning';
        return 'good';
      case 'Light':
        if (limits.light[0] !== null && value < limits.light[0]) return 'bad';
        if (limits.light[1] !== null && value > limits.light[1]) return 'bad';
        if (limits.light[0] !== null && value < limits.light[0] * 1.2) return 'warning';
        if (limits.light[1] !== null && value > limits.light[1] * 0.8) return 'warning';
        return 'good';
      case 'Energy': {
        const roomVolume = (roomInfo.length || 4) * (roomInfo.width || 3) * (roomInfo.height || 3);
        const targetEnergy = (BASELINE_KWH_PER_M3[roomType] || 0.2) * roomVolume;
        if (value > targetEnergy * 1.2) return 'bad';
        if (value > targetEnergy * 1.1) return 'warning';
        return 'good';
      }
      default:
        return 'neutral';
    }
  };
  
  // Format the data for the chart, applying unit conversions
  const formatChartData = (data) => {
    return data.map(item => {
      // Use unit context to convert values based on user preferences
      let convertedCurrent = item.current;
      let convertedTarget = item.target;
      
      // Get the appropriate metric key for unit conversion
      let metricKey = item.category.toLowerCase();
      
      // Convert values based on user's unit preferences
      if (units[metricKey] && item.unit) {
        convertedCurrent = convertValue(metricKey, item.current, item.unit);
        convertedTarget = convertValue(metricKey, item.target, item.unit);
      }
      
      return {
        name: item.category,
        Current: convertedCurrent,
        Target: convertedTarget,
        unit: units[metricKey] || item.unit,
        min: item.min,
        max: item.max,
        status: item.status
      };
    });
  };
  
  const chartData = formatChartData(getComparisonData());
  
  // Get fill color for bar
  const getBarFill = () => {
    return 'rgba(0, 0, 0, 0.1)'; // Transparent fill
  };

  // Format value with appropriate unit
  const formatMetricValue = (value, metricType) => {
    if (value === undefined || value === null) return 'N/A';
    
    // Get the appropriate metric key
    const metricKey = metricType.toLowerCase();
    const baseUnit = getBaseUnitForMetric(metricKey);
    
    // Use the unit context to format with proper units
    return formatValue(metricKey, value, baseUnit);
  };
  
  // Get base unit for a metric
  const getBaseUnitForMetric = (metricKey) => {
    switch(metricKey) {
      case 'temperature': return 'celsius';
      case 'co2': return 'ppm';
      case 'light': return 'lux';
      case 'energy': return 'kwh';
      default: return '';
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get normalized room ID (without 'room' prefix)
  const getNormalizedRoomId = () => {
    return selectedRoom?.toString().replace('room', '') || '';
  };
  
  // Toggle chart type
  const toggleChartType = () => {
    setChartType(chartType === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <h3 className="card-title">Target vs Reality</h3>
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          Loading room data for Room {getNormalizedRoomId()}...
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <h3 className="card-title">Target vs Reality</h3>
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#ef4444' }}>
          {error}
        </div>
      </>
    );
  }

  // Render chart
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>Target vs Reality</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleChartType}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {chartType === 'horizontal' ? 'Switch to Vertical' : 'Switch to Horizontal'}
          </button>
          <div className="date-selector">
            <input 
              type="date"
              value={selectedDate || ''}
              onChange={handleDateChange}
              disabled={dateLoading}
              max={new Date().toISOString().split('T')[0]} // Set max date to today
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>
      
      {dateLoading ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          Loading data for Room {getNormalizedRoomId()} on {formatDateForDisplay(selectedDate)}...
        </div>
      ) : !dataExists ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          {(() => {
            // Check if selected date is in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset to start of today
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0); // Reset to start of selected date
            
            if (selectedDateObj > today) {
              return (
                <div style={{ color: '#ef4444' }}>
                  <p><strong>Future date selected</strong>: {formatDateForDisplay(selectedDate)} is in the future.</p>
                  <p>No data exists for future dates. Please select today or a past date.</p>
                </div>
              );
            } else {
              return (
                <p>No data available for Room {getNormalizedRoomId()} on {formatDateForDisplay(selectedDate)}.</p>
              );
            }
          })()}
          <div style={{ margin: '20px 0' }}>
            <div className="chart-container" style={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <p>No data to display</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'horizontal' ? (
                // Horizontal bar chart
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Measurement Values', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="Current" 
                    name="Current"
                    barSize={20}
                    fillOpacity={0.8}
                    fill="#333"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="Target" 
                    name="Target" 
                    fill="#FFD700" 
                    barSize={20}
                    fillOpacity={0.8}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              ) : (
                // Vertical bar chart
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Measurement Values', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="Current" 
                    name="Current"
                    barSize={30}
                    fillOpacity={0.8}
                    fill="#333"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="Target" 
                    name="Target" 
                    fill="#FFD700" 
                    barSize={30}
                    fillOpacity={0.8}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Room and date info */}
          <div style={{ 
            padding: '8px 12px', 
            background: '#f9fafb', 
            borderRadius: '6px',
            marginTop: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#4b5563',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Room {getNormalizedRoomId()}</span> 
              <span>({roomInfo.room_type || 'Bedroom'})</span>
              <span>-</span> 
              <span>Volume: {((roomInfo.length || 4) * (roomInfo.width || 3) * (roomInfo.height || 3)).toFixed(1)} m³</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Date:</span> 
              <span>{formatDateForDisplay(selectedDate)}</span>
            </div>
          </div>
          
          {/* Status indicators - now transparent with converted values */}
          <div className="card" style={{ marginTop: '16px' }}>
            <h3 className="card-title">Room Status Indicators</h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '10px'
            }}>
              {getComparisonData().map((item, index) => (
                <div key={index} style={{ 
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent', // Transparent background
                  border: '1px solid #e5e7eb', // Just a border to define the shape
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '4px',
                    fontSize: '16px' 
                  }}>
                    {item.category}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '14px' 
                  }}>
                    <div>Current: <strong>{formatMetricValue(item.current, item.category)}</strong></div>
                    <div>Target: <strong>{formatMetricValue(item.target, item.category)}</strong></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Flags section */}
            {dailySummary && dailySummary.flags && dailySummary.flags.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#4b5563'
                }}>
                  Room Quality Flags
                </h4>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px'
                }}>
                  {dailySummary.flags.map((flag, index) => (
                    <div key={index} style={{ 
                      flex: '1 1 calc(33.33% - 10px)',
                      minWidth: '180px',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent', // Transparent background
                      border: '1px solid #e5e7eb', // Simple border
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ 
                        fontSize: '24px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {FLAG_ICONS[flag] || '🚩'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{flag.replace('_', ' ').toUpperCase()}</div>
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>{FLAG_DESCRIPTIONS[flag] || 'Issue detected'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default TargetVsReality;