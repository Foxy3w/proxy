// Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BoxAnalysis from './components/BoxAnalysis';
import AnalysisDiagram from './components/AnalysisDiagram';
import TargetVsReality from './components/TargetVsReality';
import DevicesBattery from './components/DevicesBattery';
import NoDataFallback from './components/NoDataFallback';

const Dashboard = () => {
  // State for the selected room - ALWAYS default to '1'
  const [selectedRoom, setSelectedRoom] = useState('1');
  
  // State for data from API
  const [currentMetrics, setCurrentMetrics] = useState([]);
  const [targetComparison, setTargetComparison] = useState([]);
  const [sensorStatus, setSensorStatus] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    metrics: true,
    comparison: true,
    sensors: true
  });
  
  // Error states
  const [errors, setErrors] = useState({
    metrics: null,
    comparison: null,
    sensors: null
  });
  
  // Create sample data function
  const createSampleData = async () => {
    try {
      setLoading({
        metrics: true,
        comparison: true, 
        sensors: true
      });
      
      // Create a sample reading for the selected room
      const sampleReading = {
        room: selectedRoom,
        temperature: 22.5,
        humidity: 65,
        energy: 240,
        light: 450,
        pressure: 1013,
        co2: 800,
        occupancy: true
      };
      
      // Send the sample data to the API
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/readings`, sampleReading);
      console.log('Sample data created for room:', selectedRoom);
      
      // Refetch data
      fetchData();
    } catch (error) {
      console.error('Error creating sample data:', error);
      setErrors({
        metrics: "Failed to create sample data",
        comparison: "Failed to create sample data",
        sensors: "Failed to create sample data"
      });
      setLoading({
        metrics: false,
        comparison: false,
        sensors: false
      });
    }
  };
  
  // Fetch data for the selected room
  useEffect(() => {
    if (!selectedRoom) {
      setSelectedRoom('1'); // Ensure we always have a room selected
      return;
    }
    
    fetchData();
  }, [selectedRoom]);
  
  const fetchData = async () => {
    try {
      console.log("Fetching data for room:", selectedRoom);
      
      // Set loading states
      setLoading({
        metrics: true,
        comparison: true,
        sensors: true
      });
      
      // Clear any previous errors
      setErrors({
        metrics: null,
        comparison: null,
        sensors: null
      });
      
      // Fetch the latest reading for the selected room
      try {
        // Make sure we're using the correct endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/readings/latest/${selectedRoom}`);
        console.log("Latest reading response:", response);
        
        if (response.data) {
          const reading = response.data;
          
          // Format the metrics - with exact property names matching the data
          const formattedMetrics = [
            { title: 'Energy', value: reading.energy, unit: 'kwh', color: 'energy' },
            { title: 'Occupancy', value: reading.occupancy === true || reading.occupancy === 'true' || reading.Occupancy === true || reading.Occupancy === 'true', color: 'occupancy' },
            { title: 'Temperature', value: reading.temperature, unit: 'celsius', color: 'temperature' },
            { title: 'Humidity', value: reading.humidity, unit: 'percent', color: 'humidity' },
            { title: 'Light Intensity', value: reading.light, unit: 'lux', color: 'light' },
            { title: 'Pressure', value: reading.pressure, unit: 'hpa', color: 'pressure' },
            { title: 'CO2', value: reading.co2 || reading.CO2, unit: 'ppm', color: 'co2' }
          ];
          
          // Filter out any metrics with undefined values
          const validMetrics = formattedMetrics.filter(metric => 
            metric.value !== undefined && metric.value !== null
          );
          
          setCurrentMetrics(validMetrics);
        } else {
          throw new Error("No reading data available");
        }
        
        setLoading(prev => ({ ...prev, metrics: false }));
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setErrors(prev => ({ ...prev, metrics: "Error loading metrics data" }));
        setLoading(prev => ({ ...prev, metrics: false }));
        setCurrentMetrics([]);
      }
      
      // Target vs Reality data
      try {
        // First try to get real data if available
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/readings/history/${selectedRoom}?metric=temperature&limit=7`);
          
          if (Array.isArray(response.data) && response.data.length >= 7) {
            // We have enough real data to create a comparison
            const comparisonData = response.data.map((reading, index) => {
              // Create goals that are close to but slightly different from actual readings
              const goalTemp = Math.round(reading.temperature * 0.9 + 2);
              return {
                day: `DAY ${index + 1}`,
                goal: goalTemp,
                heat: reading.temperature
              };
            });
            
            setTargetComparison(comparisonData);
          } else {
            // Not enough data, fallback to default handling
            throw new Error("Not enough temperature history for comparison");
          }
        } catch (err) {
          // Use empty array - no fallback to mock data
          setTargetComparison([]);
        }
        
        setLoading(prev => ({ ...prev, comparison: false }));
      } catch (error) {
        console.error("Error with comparison data:", error);
        setErrors(prev => ({ ...prev, comparison: "Error loading comparison data" }));
        setLoading(prev => ({ ...prev, comparison: false }));
      }
      
      // Fetch sensor data
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sensors`);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSensorStatus(response.data);
        } else {
          // Use empty array - no fallback to mock data
          setSensorStatus([]);
        }
        
        setLoading(prev => ({ ...prev, sensors: false }));
      } catch (error) {
        console.error("Error with sensor data:", error);
        setErrors(prev => ({ ...prev, sensors: "Error loading sensors data" }));
        setLoading(prev => ({ ...prev, sensors: false }));
      }
      
    } catch (error) {
      console.error('General error fetching data:', error);
      setErrors({
        metrics: "Error loading metrics data",
        comparison: "Error loading comparison data",
        sensors: "Error loading sensors data"
      });
      setLoading({
        metrics: false,
        comparison: false,
        sensors: false
      });
    }
  };
  
  // Function to select a room
  const handleRoomSelect = (roomId) => {
    if (roomId !== selectedRoom) {
      console.log("Changing room to:", roomId);
      setSelectedRoom(roomId);
      
      // Reset loading states when room changes
      setLoading({
        metrics: true,
        comparison: true,
        sensors: true
      });
      
      // Clear any previous errors
      setErrors({
        metrics: null,
        comparison: null,
        sensors: null
      });
      
      // Clear current metrics data to avoid showing stale data
      setCurrentMetrics([]);
      
      // Fetch new data for the selected room
      fetchData();
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        {/* Box Analysis Section - Full width */}
        <div className="full-width-grid-item">
          <BoxAnalysis 
            metrics={currentMetrics} 
            loading={loading.metrics} 
            error={errors.metrics}
            selectedRoom={selectedRoom}
            onRoomSelect={handleRoomSelect}
            onCreateSample={createSampleData}
          />
        </div>
      </div>
      
      {/* Two-column layout for middle section */}
      <div className="dashboard-row">
        {/* Left column: Monthly Analysis Diagram */}
        <div className="dashboard-column">
          <div className="card">
            <AnalysisDiagram selectedRoom={selectedRoom} />
          </div>
        </div>
        
        {/* Right column: Target vs Reality */}
        <div className="dashboard-column">
          <div className="card">
            {loading.comparison ? (
              <div className="loading-text">Loading comparison data...</div>
            ) : errors.comparison ? (
              <div className="error-text">{errors.comparison}</div>
            ) : (
              <TargetVsReality selectedRoom={selectedRoom} />
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;