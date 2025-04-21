// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.post('/data', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('esp32_data');
    const collection = db.collection('readings');

    const result = await collection.insertOne(req.body);
    res.send("✅ Data stored: " + result.insertedId);
  } catch (err) {
    console.error("MongoDB error:", err);
    res.status(500).send("❌ MongoDB error: " + err.message);
  } finally {
    await client.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
