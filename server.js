const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb://esp32user:mKtHATiPPLFExcU4@ac-4kgzd7c-shard-00-00.4kgzd7c.mongodb.net:27017,ac-4kgzd7c-shard-00-01.4kgzd7c.mongodb.net:27017,ac-4kgzd7c-shard-00-02.4kgzd7c.mongodb.net:27017/esp32_data?ssl=true&replicaSet=atlas-lgfrk2-shard-0&authSource=admin&retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.post('/data', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('esp32_data');
    const collection = db.collection('readings');

    const data = req.body;
    await collection.insertOne(data);

    res.send('✅ Data stored in MongoDB');
  } catch (error) {
    console.error('Error inserting to MongoDB:', error);
    res.status(500).send('❌ Error storing data: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
