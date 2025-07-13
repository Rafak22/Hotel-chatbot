import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ChatInterface from './components/ChatInterface';
import RoomSelection from './components/RoomSelection';
import QRCodeGenerator from './components/QRCodeGenerator';
import './App.css';

// Socket.IO connection
let socket;

function App() {
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setSocketConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setSocketConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RoomSelection />} />
          <Route path="/room/:roomNumber" element={<ChatRoom socket={socket} />} />
          <Route path="/qr" element={<QRCodeGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

// ChatRoom component that uses the room number from URL
function ChatRoom({ socket }) {
  const { roomNumber } = useParams();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (socket && roomNumber) {
      socket.emit('join-room', roomNumber);
    }
  }, [socket, roomNumber]);

  return (
    <ChatInterface 
      socket={socket} 
      roomNumber={roomNumber} 
      language={language}
      onLanguageChange={setLanguage}
    />
  );
}

export default App; 