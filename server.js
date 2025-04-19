const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/data', async (req, res) => {
  try {
    const response = await axios.post(
      'http://sea.free.nf/index.php',
      new URLSearchParams(req.body),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    res.send(`Forwarded to sea.free.nf: ${response.data}`);
  } catch (error) {
    res.status(500).send(`Error forwarding: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});