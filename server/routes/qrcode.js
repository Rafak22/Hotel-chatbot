const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

const CHATBOT_URL = 'https://hotelbot.example.com'; // Change to your real chatbot URL

router.get('/', async (req, res) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(CHATBOT_URL, { width: 300, margin: 2 });
    res.send(`
      <html>
        <head>
          <title>Hotel Chatbot QR Code</title>
          <style>
            body { font-family: sans-serif; text-align: center; margin-top: 40px; }
            img { width: 300px; height: 300px; }
            .download-btn { margin-top: 20px; padding: 10px 20px; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Scan to Chat with Us!</h1>
          <img id="qr" src="${qrDataUrl}" alt="Hotel Chatbot QR Code" />
          <br/>
          <a href="${qrDataUrl}" download="hotelbot-qr.png" class="download-btn">Download QR Code</a>
          <p>Or print this page for display in hotel rooms.</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Failed to generate QR code');
  }
});

module.exports = router; 