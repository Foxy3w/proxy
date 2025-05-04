// Sample mock data for development/testing

export const currentMetricsResponse = [
  { title: "Energy", value: "240 kWh", color: "energy" },
  { title: "Occupancy", value: "12", color: "occupancy" },
  { title: "Temperature", value: "24.5°C", color: "temperature" },
  { title: "Humidity", value: "65%", color: "humidity" },
  { title: "Light Intensity", value: "450 lux", color: "light" },
  { title: "Pressure", value: "1013 hPa", color: "pressure" }
];

export const roomsResponse = [
  { 
    id: "room1", 
    name: "1",
    room_type: "Bedroom",
    height: 3,
    width: 3,
    length: 4,
    sensors: [
      {
        id: "sensor1",
        batteryLevel: 92,
        connected: true
      },
      {
        id: "sensor2",
        batteryLevel: 85,
        connected: true
      },
      {
        id: "sensor3",
        batteryLevel: 78,
        connected: true
      }
    ]
  },
  { 
    id: "room2", 
    name: "2",
    room_type: "Living Room",
    height: 3.2,
    width: 5,
    length: 6,
    sensors: [
      {
        id: "sensor4",
        batteryLevel: 65,
        connected: true
      },
      {
        id: "sensor5",
        batteryLevel: 45,
        connected: true
      }
    ]
  },
  { 
    id: "room3", 
    name: "3",
    room_type: "Kitchen",
    height: 2.8,
    width: 3.5,
    length: 4.2,
    sensors: [
      {
        id: "sensor6",
        batteryLevel: 88,
        connected: true
      },
      {
        id: "sensor7",
        batteryLevel: 76,
        connected: false
      }
    ]
  },
  { 
    id: "room4", 
    name: "4",
    room_type: "Office/Study",
    height: 2.7,
    width: 3.2,
    length: 3.5,
    sensors: [
      {
        id: "sensor8",
        batteryLevel: 12,
        connected: true
      },
      {
        id: "sensor9",
        batteryLevel: 54,
        connected: true
      }
    ]
  }
];

export const temperatureResponse = [
  { name: "00:00", temp: 22 },
  { name: "02:00", temp: 20 },
  { name: "04:00", temp: 19 },
  { name: "06:00", temp: 18 },
  { name: "08:00", temp: 19 },
  { name: "10:00", temp: 23 },
  { name: "12:00", temp: 25 },
  { name: "14:00", temp: 26 },
  { name: "16:00", temp: 25 },
  { name: "18:00", temp: 23 },
  { name: "20:00", temp: 22 },
  { name: "22:00", temp: 21 }
];

export const comparisonResponse = [
  { day: "DAY 1", goal: 20, heat: 22 },
  { day: "DAY 2", goal: 22, heat: 23 },
  { day: "DAY 3", goal: 24, heat: 22 },
  { day: "DAY 4", goal: 24, heat: 26 },
  { day: "DAY 5", goal: 23, heat: 25 },
  { day: "DAY 6", goal: 21, heat: 22 },
  { day: "DAY 7", goal: 20, heat: 21 }
];

// Complete sensors response with all details
export const sensorsResponse = [
  {
    id: "sensor1",
    batteryLevel: 92,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X2",
    firmwareVersion: "2.3.5",
    installDate: "2023-12-01T10:15:00Z",
    lastCalibration: "2024-10-15T08:30:00Z",
    lastReadingTime: "2025-04-21T06:45:23Z",
    lastReading: { temperature: 24.5, humidity: 65 }
  },
  {
    id: "sensor2",
    batteryLevel: 85,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X2",
    firmwareVersion: "2.3.5",
    installDate: "2023-12-01T11:20:00Z",
    lastCalibration: "2024-10-15T09:15:00Z",
    lastReadingTime: "2025-04-21T06:48:12Z",
    lastReading: { temperature: 23.8, humidity: 62 }
  },
  {
    id: "sensor3",
    batteryLevel: 78,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X2",
    firmwareVersion: "2.3.5",
    installDate: "2023-12-01T12:30:00Z",
    lastCalibration: "2024-10-15T10:00:00Z",
    lastReadingTime: "2025-04-21T06:42:56Z",
    lastReading: { temperature: 25.1, humidity: 63 }
  },
  {
    id: "sensor4",
    batteryLevel: 65,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X2",
    firmwareVersion: "2.3.5",
    installDate: "2023-12-02T09:10:00Z",
    lastCalibration: "2024-10-16T08:30:00Z",
    lastReadingTime: "2025-04-21T06:44:32Z",
    lastReading: { temperature: 22.7, humidity: 58 }
  },
  {
    id: "sensor5",
    batteryLevel: 45,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X2",
    firmwareVersion: "2.3.5",
    installDate: "2023-12-02T10:20:00Z",
    lastCalibration: "2024-10-16T09:15:00Z",
    lastReadingTime: "2025-04-21T06:40:18Z",
    lastReading: { temperature: 23.2, humidity: 60 }
  },
  {
    id: "sensor6",
    batteryLevel: 88,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X3",
    firmwareVersion: "3.1.2",
    installDate: "2023-12-03T09:45:00Z",
    lastCalibration: "2024-10-17T08:30:00Z",
    lastReadingTime: "2025-04-21T06:46:45Z",
    lastReading: { temperature: 24.0, humidity: 67 }
  },
  {
    id: "sensor7",
    batteryLevel: 76,
    connected: false,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X3",
    firmwareVersion: "3.1.2",
    installDate: "2023-12-03T10:30:00Z",
    lastCalibration: "2024-10-17T09:15:00Z",
    lastReadingTime: "2025-04-20T18:32:11Z", // Last reading yesterday
    lastReading: { temperature: 22.5, humidity: 61 }
  },
  {
    id: "sensor8",
    batteryLevel: 12,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X3",
    firmwareVersion: "3.1.2",
    installDate: "2023-12-03T11:20:00Z",
    lastCalibration: "2024-10-17T10:00:00Z",
    lastReadingTime: "2025-04-21T06:41:39Z",
    lastReading: { temperature: 23.9, humidity: 64 }
  },
  {
    id: "sensor9",
    batteryLevel: 54,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "SensorTech Ltd.",
    model: "EcoSense X3",
    firmwareVersion: "3.1.2",
    installDate: "2023-12-04T09:15:00Z",
    lastCalibration: "2024-10-18T08:30:00Z",
    lastReadingTime: "2025-04-21T06:45:07Z",
    lastReading: { temperature: 24.3, humidity: 59 }
  },
  {
    id: "sensor10",
    batteryLevel: 95,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "ClimateSense",
    model: "CS-100",
    firmwareVersion: "1.5.0",
    installDate: "2024-02-15T10:00:00Z",
    lastCalibration: "2024-10-20T09:00:00Z",
    lastReadingTime: "2025-04-21T06:47:28Z",
    lastReading: { temperature: 23.5, humidity: 62 }
  },
  {
    id: "sensor11",
    batteryLevel: 82,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "ClimateSense",
    model: "CS-100",
    firmwareVersion: "1.5.0",
    installDate: "2024-02-15T11:30:00Z",
    lastCalibration: "2024-10-20T10:15:00Z",
    lastReadingTime: "2025-04-21T06:43:15Z",
    lastReading: { temperature: 24.2, humidity: 63 }
  },
  {
    id: "sensor12",
    batteryLevel: 71,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "ClimateSense",
    model: "CS-100",
    firmwareVersion: "1.5.0",
    installDate: "2024-02-15T13:00:00Z",
    lastCalibration: "2024-10-20T11:30:00Z",
    lastReadingTime: "2025-04-21T06:44:52Z",
    lastReading: { temperature: 22.9, humidity: 58 }
  },
  {
    id: "sensor13",
    batteryLevel: 18,
    connected: false,
    type: "Temperature & Humidity",
    manufacturer: "ClimateSense",
    model: "CS-100",
    firmwareVersion: "1.5.0",
    installDate: "2024-02-16T09:30:00Z",
    lastCalibration: "2024-10-21T09:00:00Z",
    lastReadingTime: "2025-04-19T14:22:38Z", // Disconnected for a while
    lastReading: { temperature: 25.8, humidity: 70 }
  },
  {
    id: "sensor14",
    batteryLevel: 63,
    connected: true,
    type: "Temperature & Humidity",
    manufacturer: "ClimateSense",
    model: "CS-100",
    firmwareVersion: "1.5.0",
    installDate: "2024-02-16T11:00:00Z",
    lastCalibration: "2024-10-21T10:15:00Z",
    lastReadingTime: "2025-04-21T06:46:03Z",
    lastReading: { temperature: 23.7, humidity: 61 }
  }
];

export const compatibilityResponse = {
  standard: "ISO 50001",
  status: "Compliant"
};

// Create a named export for the default data object to fix the ESLint warning
const mockDataExport = {
  currentMetrics: currentMetricsResponse,
  rooms: roomsResponse,
  temperature: temperatureResponse,
  comparison: comparisonResponse,
  sensors: sensorsResponse,
  compatibility: compatibilityResponse
};

export default mockDataExport;