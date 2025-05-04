import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnits } from '../context/UnitContext';
import axios from 'axios';

const AnalysisDiagram = ({ selectedRoom = '1' }) => {
  // State variables
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rawChartData, setRawChartData] = useState([]); // Store raw data
  const [processedChartData, setProcessedChartData] = useState([]); // Store processed/converted data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false); // Track if API was attempted
  
  // Get unit context
  const { formatValue, convertValue, units } = useUnits();
  
  // Available metrics with their display properties
  const metrics = {
    temperature: { 
      color: '#fca5a5', 
      label: 'Temperature',
      baseUnit: 'celsius',
      property: 'avg_temperature',
      apiParam: 'temperature'
    },
    co2: { 
      color: '#818cf8', 
      label: 'CO2',
      baseUnit: 'ppm',
      property: 'max_CO2',
      apiParam: 'co2'
    },
    light: { 
      color: '#fdba74', 
      label: 'Light Intensity',
      baseUnit: 'lux',
      property: 'avg_light',
      apiParam: 'light'
    },
    energy: { 
      color: '#fcd34d', 
      label: 'Energy',
      baseUnit: 'kwh',
      property: 'daily_energy_kwh',
      apiParam: 'energy'
    }
  };
  
  // Get current metric info
  const currentMetric = metrics[selectedMetric];
  
  // Month names for dropdown
  const monthNames = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  // Years for dropdown (5 years back)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    availableYears.push(currentYear - i);
  }
  
  // Process raw data with unit conversions any time the raw data or units change
  useEffect(() => {
    if (rawChartData.length > 0) {
      const convertedData = rawChartData.map(item => {
        // Get the base value
        const baseValue = item.value;
        
        // Apply unit conversion based on the selected metric
        let convertedValue = baseValue;
        
        if (selectedMetric === 'temperature' && units.temperature !== currentMetric.baseUnit) {
          // Convert temperature from base unit (Celsius) to user's preferred unit
          convertedValue = convertValue('temperature', baseValue, currentMetric.baseUnit);
        } else if (selectedMetric === 'co2' && units.co2 !== currentMetric.baseUnit) {
          // Convert CO2 units if needed
          convertedValue = convertValue('co2', baseValue, currentMetric.baseUnit);
        } else if (selectedMetric === 'light' && units.light !== currentMetric.baseUnit) {
          // Convert light units if needed
          convertedValue = convertValue('light', baseValue, currentMetric.baseUnit);
        } else if (selectedMetric === 'energy' && units.energy !== currentMetric.baseUnit) {
          // Convert energy units if needed
          convertedValue = convertValue('energy', baseValue, currentMetric.baseUnit);
        }
        
        return {
          ...item,
          value: convertedValue
        };
      });
      
      setProcessedChartData(convertedData);
    } else {
      setProcessedChartData([]);
    }
  }, [rawChartData, units, selectedMetric]);
  
  // Fetch data when component mounts or when metric/month/room changes
  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMetric, selectedMonth, selectedYear, selectedRoom]);
  
  // Fetch monthly data for selected metric and month
  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDataExists(false);
      setApiAttempted(true); // Mark that we attempted to call the API
      
      // Normalize room ID
      const roomId = selectedRoom.toString().replace('room', '');
      
      // Create date range for selected month
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      
      // Format dates as strings
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      console.log(`Fetching data for room ${roomId}, metric ${selectedMetric}, period ${startDate} to ${endDate}`);
      
      // Fetch daily summaries for the selected month
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/daily_summary/${roomId}`,
        {
          params: { 
            start: startDate,
            end: endDate
          }
        }
      );
      
      // Process data
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Got ${response.data.length} data points for ${monthNames[selectedMonth]} ${selectedYear}`);
        
        // Check if there's at least 2 data points
        if (response.data.length >= 2) {
          // Extract and format data for the chart
          const formattedData = response.data
            .filter(item => item[currentMetric.property] !== undefined && item[currentMetric.property] !== null)
            .map(item => {
              // Parse date
              const date = new Date(item.date);
              // Use property name from the metric configuration
              const value = item[currentMetric.property];
              
              return {
                day: date.getDate(),
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                value: value,
              };
            })
            // Sort by day
            .sort((a, b) => a.day - b.day);
          
          // Only set data as existing if we have formatted data
          if (formattedData.length >= 2) {
            setRawChartData(formattedData); // Store raw data
            setDataExists(true);
          } else {
            console.log('Not enough valid data points for this metric in the selected month');
            setRawChartData([]);
            setDataExists(false);
          }
        } else {
          console.log('Not enough data points for the selected month');
          setRawChartData([]);
          setDataExists(false);
        }
      } else {
        console.log('No data available for the selected month');
        setRawChartData([]);
        setDataExists(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Failed to load diagram data');
      setRawChartData([]);
      setDataExists(false);
      setLoading(false);
    }
  };
  
  // Handle metric change
  const handleMetricChange = (e) => {
    setSelectedMetric(e.target.value);
  };
  
  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };
  
  // Get current unit name based on the metric
  const getCurrentUnitName = () => {
    switch(selectedMetric) {
      case 'temperature':
        return units.temperature === 'celsius' ? '°C' : 
               units.temperature === 'fahrenheit' ? '°F' :
               units.temperature === 'kelvin' ? 'K' : '';
      case 'co2':
        return units.co2 === 'ppm' ? 'ppm' : 
               units.co2 === 'mgm3' ? 'mg/m³' : '';
      case 'light':
        return units.light === 'lux' ? 'lux' :
               units.light === 'footCandle' ? 'fc' : '';
      case 'energy':
        return units.energy === 'kwh' ? 'kWh' :
               units.energy === 'mwh' ? 'MWh' :
               units.energy === 'joule' ? 'J' :
               units.energy === 'btu' ? 'BTU' : '';
      default:
        return '';
    }
  };
  
  // Get Y-axis label with proper unit
  const getYAxisLabel = () => {
    return `${currentMetric.label} (${getCurrentUnitName()})`;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>Monthly Analysis</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={handleYearChange}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && apiAttempted ? (
        <div className="analysis-chart" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading {currentMetric.label.toLowerCase()} data...</p>
        </div>
      ) : error ? (
        <div className="analysis-chart" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : !dataExists ? (
        <div className="analysis-chart" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          border: '1px dashed #ccc',
          height: '250px'
        }}>
          <p>Not enough data available for {monthNames[selectedMonth]} {selectedYear}</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>At least 2 days of readings are required to display a chart</p>
        </div>
      ) : (
        <div className="analysis-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => {
                  return [value.toFixed(1) + getCurrentUnitName(), currentMetric.label];
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={currentMetric.color}
                strokeWidth={3}
                dot={{ r: 2, fill: currentMetric.color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="analysis-footer">
        <div 
          className="metric-selector-button"
          style={{ 
            backgroundColor: currentMetric.color,
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <select 
            className="metric-selector"
            value={selectedMetric}
            onChange={handleMetricChange}
            style={{
              width: '100%',
              height: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              appearance: 'none',
              textAlign: 'center',
              outline: 'none'
            }}
          >
            {Object.entries(metrics).map(([key, metric]) => (
              <option key={key} value={key}>{metric.label}</option>
            ))}
          </select>
        </div>
        
        <div className="unit-container">
          <span className="unit-label">Unit:</span>
          <span className="unit-value">
            {/* Display the proper unit symbol */}
            {getCurrentUnitName()}
          </span>
        </div>
      </div>
    </>
  );
};

export default AnalysisDiagram;