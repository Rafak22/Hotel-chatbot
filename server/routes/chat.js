const express = require('express');
const router = express.Router();

// Get chat history for a room
router.get('/history/:roomNumber', (req, res) => {
  const { roomNumber } = req.params;
  
  // In a real implementation, this would fetch from database
  // For now, return empty array
  res.json({
    success: true,
    messages: []
  });
});

// Send a message (alternative to Socket.IO)
router.post('/send', (req, res) => {
  const { message, roomNumber, language = 'en' } = req.body;
  
  if (!message || !roomNumber) {
    return res.status(400).json({
      success: false,
      error: 'Message and room number are required'
    });
  }
  
  // Process message and return response
  // This would typically be handled by Socket.IO in real-time
  res.json({
    success: true,
    message: 'Message sent successfully'
  });
});

module.exports = router; 