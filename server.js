const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/data', async (req, res) => {
  try {
    // Dynamically forward whatever the ESP32 sends
    const postData = new URLSearchParams(req.body);

    const response = await axios.post(
      'http://sea.free.nf/index.php',
      postData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.send(`✅ Forwarded to sea.free.nf:\n\n${response.data}`);
  } catch (error) {
    res.status(500).send(`❌ Error forwarding: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
