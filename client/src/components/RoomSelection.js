import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';

const RoomSelection = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [customRoom, setCustomRoom] = useState('');
  const navigate = useNavigate();

  // Generate room numbers for different floors
  const generateRoomNumbers = () => {
    const rooms = [];
    // Floor 2: 201-220
    for (let i = 201; i <= 220; i++) {
      rooms.push(i);
    }
    // Floor 3: 301-320
    for (let i = 301; i <= 320; i++) {
      rooms.push(i);
    }
    // Floor 4: 401-420
    for (let i = 401; i <= 420; i++) {
      rooms.push(i);
    }
    // Floor 5: 501-520
    for (let i = 501; i <= 520; i++) {
      rooms.push(i);
    }
    return rooms;
  };

  const roomNumbers = generateRoomNumbers();

  const handleRoomSelect = (roomNumber) => {
    setSelectedRoom(roomNumber);
    setCustomRoom('');
  };

  const handleCustomRoom = () => {
    if (customRoom.trim()) {
      setSelectedRoom(parseInt(customRoom));
    }
  };

  const handleContinue = () => {
    if (selectedRoom) {
      navigate(`/room/${selectedRoom}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomRoom();
    }
  };

  return (
    <div className="main-content">
      <div className="welcome-screen">
        <h1 className="welcome-title">🏨 Hotel Virtual Assistant</h1>
        <p className="welcome-subtitle">
          Your personal concierge for room service, WiFi, housekeeping, and more.
          Simply scan the QR code in your room or select your room number below.
        </p>
      </div>

      <div className="room-selection card">
        <h2>Select Your Room</h2>
        
        <div className="room-grid">
          {roomNumbers.map((roomNumber) => (
            <button
              key={roomNumber}
              className={`room-button ${selectedRoom === roomNumber ? 'selected' : ''}`}
              onClick={() => handleRoomSelect(roomNumber)}
            >
              {roomNumber}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Or enter your room number:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              className="form-control"
              placeholder="e.g., 315"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              onKeyPress={handleKeyPress}
              min="100"
              max="999"
            />
            <button
              className="btn btn-secondary"
              onClick={handleCustomRoom}
              disabled={!customRoom.trim()}
            >
              Set
            </button>
          </div>
        </div>

        {selectedRoom && (
          <div className="text-center">
            <p className="mb-3">
              <strong>Selected Room: {selectedRoom}</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={handleContinue}
            >
              Continue to Assistant
              <FiArrowRight />
            </button>
          </div>
        )}

        <div className="mt-4 text-center" style={{ fontSize: '14px', color: '#6c757d' }}>
          <p>
            <FiHome style={{ marginRight: '4px' }} />
            Don't see your room? Enter it manually above.
          </p>
        </div>
      </div>

      <div className="mt-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        <p style={{ fontSize: '14px' }}>
          💡 Tip: For the best experience, scan the QR code in your room for instant access!
        </p>
      </div>
    </div>
  );
};

export default RoomSelection; 