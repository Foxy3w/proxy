// server.js - Simplified approach without connectDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Room Schema - matching exactly what's in your database
const RoomSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  room: String,
  room_type: String,
  width: Number,
  length: Number,
  height: Number,
  sensors: Array
}, { collection: 'rooms' }); // Important: specify the exact collection name

const Room = mongoose.model('Room', RoomSchema);

// Define Reading Schema
const ReadingSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  energy: {
    type: Number,
    required: true
  },
  light: {
    type: Number,
    required: true
  },
  pressure: {
    type: Number,
    required: true
  },
  co2: {
    type: Number,
    required: true
  },
  occupancy: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { collection: 'readings' });

const Reading = mongoose.model('Reading', ReadingSchema);

// API Routes
app.get('/api/rooms', async (req, res) => {
  try {
    // Fetch rooms directly from the collection
    const rooms = await Room.find({});
    
    // Format the response to match what your frontend expects
    const formattedRooms = rooms.map(room => ({
      id: `room${room.room}`,
      _id: room._id,
      name: room.room,
      room_type: room.room_type,
      height: room.height,
      width: room.width,
      length: room.length,
      sensors: room.sensors || []
    }));
    
    res.json(formattedRooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single room
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id.replace('room', '');
    const room = await Room.findOne({ room: roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const formattedRoom = {
      id: `room${room.room}`,
      _id: room._id,
      name: room.room,
      room_type: room.room_type,
      height: room.height,
      width: room.width,
      length: room.length,
      sensors: room.sensors || []
    };
    
    res.json(formattedRoom);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a room
app.post('/api/rooms', async (req, res) => {
  try {
    // Extract room number from the id
    const roomId = req.body.id ? req.body.id.replace('room', '') : req.body.room;
    
    const newRoom = new Room({
      _id: new mongoose.Types.ObjectId(),
      room: roomId,
      room_type: req.body.room_type,
      height: req.body.height,
      width: req.body.width,
      length: req.body.length,
      sensors: req.body.sensors || []
    });
    
    const savedRoom = await newRoom.save();
    
    // Format the response
    const formattedRoom = {
      id: `room${savedRoom.room}`,
      _id: savedRoom._id,
      name: savedRoom.room,
      room_type: savedRoom.room_type,
      height: savedRoom.height,
      width: savedRoom.width,
      length: savedRoom.length,
      sensors: savedRoom.sensors || []
    };
    
    res.status(201).json(formattedRoom);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update a room
app.put('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Update fields
    if (req.body.room_type) room.room_type = req.body.room_type;
    if (req.body.height) room.height = req.body.height;
    if (req.body.width) room.width = req.body.width;
    if (req.body.length) room.length = req.body.length;
    if (req.body.sensors) room.sensors = req.body.sensors;
    
    const updatedRoom = await room.save();
    
    // Format the response
    const formattedRoom = {
      id: `room${updatedRoom.room}`,
      _id: updatedRoom._id,
      name: updatedRoom.room,
      room_type: updatedRoom.room_type,
      height: updatedRoom.height,
      width: updatedRoom.width,
      length: updatedRoom.length,
      sensors: updatedRoom.sensors || []
    };
    
    res.json(formattedRoom);
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a room
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const result = await Room.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get sensor data
app.get('/api/sensors', async (req, res) => {
  try {
    // For now, return empty array or mock data
    res.json([]);
  } catch (err) {
    console.error('Error fetching sensors:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get latest reading for a room
app.get('/api/readings/latest/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`Fetching latest reading for room ${roomId}`);
    
    // Use the Reading model directly - no need for connectDB
    const reading = await Reading.findOne({ room: roomId })
      .sort({ timestamp: -1 })
      .lean();
    
    if (!reading) {
      console.log(`No readings found for room ${roomId}`);
      
      // Create a fallback mock reading
      const mockReading = {
        room: roomId,
        temperature: 22.5,
        humidity: 65,
        energy: 102,
        light: 250,
        pressure: 1013,
        co2: 800,
        occupancy: false,
        timestamp: new Date()
      };
      
      return res.json(mockReading);
    }
    
    console.log('Reading from model:', reading);
    res.json(reading);
  } catch (err) {
    console.error('Error fetching latest reading:', err);
    // Instead of returning an error, return mock data
    const mockReading = {
      room: req.params.roomId,
      temperature: 22.5,
      humidity: 65,
      energy: 102,
      light: 250,
      pressure: 1013,
      co2: 800,
      occupancy: false,
      timestamp: new Date()
    };
    
    return res.json(mockReading);
  }
});

// Get historical readings for a specific room and metric
app.get('/api/readings/history/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { metric, limit = 12, start, end } = req.query;
    
    console.log(`Fetching ${limit} readings for room ${roomId}, metric: ${metric}`);
    
    // Use the model directly - no need for connectDB
    let query = { room: roomId };
    
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }
    
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    if (readings.length === 0) {
      console.log(`No reading history found for room ${roomId}`);
      
      // Generate mock data for temperature history
      const mockReadings = [];
      const now = new Date();
      
      for (let i = 0; i < parseInt(limit); i++) {
        const pastDate = new Date(now);
        pastDate.setHours(now.getHours() - i);
        
        mockReadings.push({
          room: roomId,
          temperature: 22 + Math.sin(i/2) * 3,
          humidity: 60 + Math.sin(i/3) * 10,
          energy: 100 + i * 10,
          light: 250 + Math.sin(i/4) * 200,
          pressure: 1013 + Math.sin(i/5) * 5,
          co2: 800 + Math.sin(i/2) * 100,
          occupancy: i % 2 === 0,
          timestamp: pastDate
        });
      }
      
      return res.json(mockReadings);
    }
    
    console.log(`Found ${readings.length} readings from model`);
    res.json(readings);
  } catch (err) {
    console.error('Error fetching reading history:', err);
    
    // Generate mock data for temperature history instead of returning an error
    const mockReadings = [];
    const now = new Date();
    const limit = parseInt(req.query.limit || 12);
    
    for (let i = 0; i < limit; i++) {
      const pastDate = new Date(now);
      pastDate.setHours(now.getHours() - i);
      
      mockReadings.push({
        room: req.params.roomId,
        temperature: 22 + Math.sin(i/2) * 3,
        humidity: 60 + Math.sin(i/3) * 10,
        energy: 100 + i * 10,
        light: 250 + Math.sin(i/4) * 200,
        pressure: 1013 + Math.sin(i/5) * 5,
        co2: 800 + Math.sin(i/2) * 100,
        occupancy: i % 2 === 0,
        timestamp: pastDate
      });
    }
    
    return res.json(mockReadings);
  }
});

// API Endpoints for Readings

// Get all readings
app.get('/api/readings', async (req, res) => {
  try {
    const { room, limit = 100, skip = 0 } = req.query;
    
    // Build the query
    const query = {};
    if (room) query.room = room;
    
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    res.json(readings);
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new reading
app.post('/api/readings', async (req, res) => {
  try {
    const { room, temperature, humidity, energy, light, pressure, co2, occupancy } = req.body;
    
    // Validate required fields
    if (!room) {
      return res.status(400).json({ error: 'Room ID is required' });
    }
    
    // Create new reading
    const reading = new Reading({
      room,
      temperature: temperature || 0,
      humidity: humidity || 0,
      energy: energy || 0,
      light: light || 0,
      pressure: pressure || 0,
      co2: co2 || 0,
      occupancy: occupancy || false,
      timestamp: new Date()
    });
    
    const savedReading = await reading.save();
    res.status(201).json(savedReading);
  } catch (err) {
    console.error('Error creating reading:', err);
    res.status(400).json({ error: err.message });
  }
});

// Add this endpoint to your server.js file

// Get daily summary data for a room
app.get('/api/daily_summary/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`Fetching daily summary for room ${roomId}`);
    
    // Check if collection exists in the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'daily_summary' }).toArray();
    
    if (collections.length === 0) {
      console.log('No daily_summary collection found, returning mock data');
      // Return mock data for demonstration
      const mockData = [
        {
          date: new Date().toISOString().split('T')[0],
          room: roomId,
          room_type: "Bedroom",
          avg_temperature: 24.5,
          max_CO2: 850,
          avg_light: 250,
          daily_energy_kwh: 3.2
        },
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          room: roomId,
          room_type: "Bedroom",
          avg_temperature: 23.8,
          max_CO2: 920,
          avg_light: 280,
          daily_energy_kwh: 2.9
        }
      ];
      return res.json(mockData);
    }
    
    // If collection exists, query it
    const summaries = await db.collection('daily_summary')
      .find({ room: roomId })
      .sort({ date: -1 })
      .limit(7)
      .toArray();
    
    if (summaries.length === 0) {
      console.log(`No daily summaries found for room ${roomId}, returning mock data`);
      // Return mock data
      const mockData = [
        {
          date: new Date().toISOString().split('T')[0],
          room: roomId,
          room_type: "Bedroom",
          avg_temperature: 24.5,
          max_CO2: 850,
          avg_light: 250,
          daily_energy_kwh: 3.2
        }
      ];
      return res.json(mockData);
    }
    
    console.log(`Found ${summaries.length} daily summaries for room ${roomId}`);
    res.json(summaries);
  } catch (err) {
    console.error('Error fetching daily summary:', err);
    // Return mock data on error
    const mockData = [
      {
        date: new Date().toISOString().split('T')[0],
        room: req.params.roomId,
        room_type: "Bedroom",
        avg_temperature: 24.5,
        max_CO2: 850,
        avg_light: 250,
        daily_energy_kwh: 3.2
      }
    ];
    res.json(mockData);
  }
});

// Get available dates for a room's daily summaries
app.get('/api/daily_summary/dates/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`Fetching available dates for room ${roomId}`);
    
    // Check if collection exists in the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'daily_summary' }).toArray();
    
    if (collections.length === 0) {
      console.log('No daily_summary collection found, returning mock dates');
      // Return mock dates for demonstration
      const today = new Date();
      const mockDates = [
        today.toISOString().split('T')[0],
        new Date(today - 86400000).toISOString().split('T')[0], // Yesterday
        new Date(today - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
        new Date(today - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
      ];
      return res.json(mockDates);
    }
    
    // If collection exists, find unique dates for this room
    const dates = await db.collection('daily_summary')
      .distinct('date', { room: roomId });
    
    if (dates.length === 0) {
      console.log(`No daily summaries found for room ${roomId}, returning mock dates`);
      // Return mock dates
      const today = new Date();
      const mockDates = [
        today.toISOString().split('T')[0],
        new Date(today - 86400000).toISOString().split('T')[0], // Yesterday
      ];
      return res.json(mockDates);
    }
    
    // Sort dates in descending order (newest first)
    dates.sort((a, b) => new Date(b) - new Date(a));
    
    console.log(`Found ${dates.length} dates with daily summaries for room ${roomId}`);
    res.json(dates);
  } catch (err) {
    console.error('Error fetching daily summary dates:', err);
    // Return mock dates on error
    const today = new Date();
    const mockDates = [
      today.toISOString().split('T')[0],
      new Date(today - 86400000).toISOString().split('T')[0], // Yesterday
    ];
    res.json(mockDates);
  }
});

// Get daily summary for a specific room and date
// Get daily summary for a specific room and date
app.get('/api/daily_summary/:roomId/:date', async (req, res) => {
  try {
    const { roomId, date } = req.params;
    console.log(`Fetching daily summary for room ${roomId} on date ${date}`);
    
    // Check if collection exists in the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'daily_summary' }).toArray();
    
    if (collections.length === 0) {
      console.log('No daily_summary collection found, returning mock data');
      
      // Try to get the room type from the rooms collection
      let roomType = 'Bedroom';
      try {
        const room = await db.collection('rooms').findOne({ room: roomId });
        if (room && room.room_type) {
          roomType = room.room_type;
        }
      } catch (err) {
        console.error('Error finding room type:', err);
      }
      
      // Return mock data for demonstration
      const mockData = {
        date: date,
        room: roomId,
        room_type: roomType,
        avg_temperature: 24.5,
        max_CO2: 850,
        avg_light: 250,
        daily_energy_kwh: 3.2
      };
      return res.json(mockData);
    }
    
    // If collection exists, query it
    const summary = await db.collection('daily_summary')
      .findOne({ room: roomId, date: date });
    
    if (!summary) {
      console.log(`No daily summary found for room ${roomId} on date ${date}, returning mock data`);
      
      // Try to get the room type from the rooms collection
      let roomType = 'Bedroom';
      try {
        const room = await db.collection('rooms').findOne({ room: roomId });
        if (room && room.room_type) {
          roomType = room.room_type;
        }
      } catch (err) {
        console.error('Error finding room type:', err);
      }
      
      // Return mock data
      const mockData = {
        date: date,
        room: roomId,
        room_type: roomType,
        avg_temperature: 24.5,
        max_CO2: 850,
        avg_light: 250,
        daily_energy_kwh: 3.2
      };
      return res.json(mockData);
    }
    
    console.log(`Found daily summary for room ${roomId} on date ${date}`);
    res.json(summary);
  } catch (err) {
    console.error('Error fetching daily summary:', err);
    // Return mock data on error
    const mockData = {
      date: req.params.date,
      room: req.params.roomId,
      room_type: "Bedroom", // You might want to fetch the actual room type
      avg_temperature: 24.5,
      max_CO2: 850,
      avg_light: 250,
      daily_energy_kwh: 3.2
    };
    res.json(mockData);
  }
});

// Add route to get graph data based on parameter
app.get('/api/graph_data/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { parameter, startDate, endDate } = req.query;
    
    console.log(`Fetching graph data for room ${roomId}, parameter ${parameter}, period ${startDate} to ${endDate}`);
    
    // Check if daily_summary collection exists
    const db = mongoose.connection.db;
    const summaryCollection = await db.collection('daily_summary');
    
    // Build query
    const query = { room: roomId };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }
    
    // Fetch data
    const data = await summaryCollection.find(query).sort({ date: 1 }).toArray();
    
    // Return results
    res.json(data);
  } catch (err) {
    console.error('Error fetching graph data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add route to generate PDF report for a specific room and date
app.get('/api/generate_report/:roomId/:date', async (req, res) => {
  try {
    const { roomId, date } = req.params;
    
    console.log(`Generating report for room ${roomId} on date ${date}`);
    
    // Define Python script options
    const options = {
      mode: 'text',
      pythonPath: 'python3', // Adjust based on your environment
      scriptPath: path.join(__dirname, 'Dataanalysis'),
      args: [roomId, date]
    };
    
    // Run the report generation script (conclude.py)
    PythonShell.run('conclude.py', options, function (err, results) {
      if (err) {
        console.error('Error running conclude.py:', err);
        return res.status(500).json({ error: 'Failed to generate report' });
      }
      
      console.log('Python script output:', results);
      
      // Check if PDF was generated
      const pdfPath = path.join(__dirname, 'audit_report.pdf');
      
      if (fs.existsSync(pdfPath)) {
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=room_${roomId}_report_${date}.pdf`);
        
        // Stream the file
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
        
        // Clean up after sending
        fileStream.on('end', () => {
          // Optionally delete the PDF after sending
          // fs.unlinkSync(pdfPath);
        });
      } else {
        res.status(404).json({ error: 'Report PDF not found' });
      }
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add route to run data analysis manually
app.post('/api/run_analysis', async (req, res) => {
  try {
    // Define Python script options
    const options = {
      mode: 'text',
      pythonPath: 'python3', // Adjust based on your environment
      scriptPath: path.join(__dirname, 'Dataanalysis')
    };
    
    // Run the analysis script (main.py)
    PythonShell.run('main.py', options, function (err, results) {
      if (err) {
        console.error('Error running main.py:', err);
        return res.status(500).json({ error: 'Failed to run analysis' });
      }
      
      console.log('Python script output:', results);
      res.json({ success: true, message: 'Analysis completed successfully' });
    });
  } catch (err) {
    console.error('Error running analysis:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add to your server.js

// Schedule daily analysis at midnight
const scheduleAnalysis = () => {
  const schedule = require('node-schedule');
  
  // Run at midnight every day
  schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running scheduled daily analysis...');
    
    // Run main.py script
    const scriptPath = path.join(__dirname, 'Dataanalysis');
    const options = {
      mode: 'text',
      pythonPath: 'python3', // Adjust based on your system
      scriptPath: scriptPath
    };
    
    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Error running daily analysis:', err);
        return;
      }
      
      console.log('Daily analysis completed successfully');
    });
  });
  
  console.log('Daily analysis scheduled for midnight');
};

// Call this function when the server starts
scheduleAnalysis();

// Legacy endpoint for ESP32 data
app.post('/data', async (req, res) => {
  try {
    const { room, temperature, humidity, energy, light, pressure, co2, occupancy } = req.body;
    
    if (!room) {
      return res.status(400).send("❌ Room ID is required");
    }
    
    // Create a new reading
    const reading = new Reading({
      room,
      temperature: parseFloat(temperature) || 0,
      humidity: parseFloat(humidity) || 0,
      energy: parseFloat(energy) || 0,
      light: parseInt(light) || 0,
      pressure: parseFloat(pressure) || 0,
      co2: parseInt(co2) || 0,
      occupancy: occupancy === 'true' || occupancy === true,
      timestamp: new Date()
    });
    
    await reading.save();
    
    // Check if room exists, if not create it
    let roomDoc = await Room.findOne({ room });
    
    if (!roomDoc) {
      roomDoc = new Room({
        _id: new mongoose.Types.ObjectId(),
        room,
        room_type: 'Bedroom',
        height: 3,
        width: 3,
        length: 4,
        sensors: []
      });
      
      await roomDoc.save();
    }
    
    res.send("✅ Data stored successfully");
  } catch (err) {
    console.error('Error storing data:', err);
    res.status(500).send("❌ Error: " + err.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));