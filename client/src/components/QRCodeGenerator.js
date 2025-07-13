import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { FiDownload, FiCopy, FiPrinter } from 'react-icons/fi';

const QRCodeGenerator = () => {
  const [selectedRoom, setSelectedRoom] = useState('201');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [qrSize, setQrSize] = useState(256);

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
  const qrUrl = `${baseUrl}/room/${selectedRoom}`;

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-room-${selectedRoom}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      alert('URL copied to clipboard!');
    });
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - Room ${selectedRoom}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
            }
            .qr-container { 
              display: inline-block; 
              padding: 20px; 
              border: 2px solid #333;
              border-radius: 10px;
            }
            .room-info {
              margin-top: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            .instructions {
              margin-top: 10px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div style="display: inline-block;">
              ${document.querySelector('svg')?.outerHTML || ''}
            </div>
            <div class="room-info">Room ${selectedRoom}</div>
            <div class="instructions">Scan to access your personal assistant</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="main-content">
      <div className="welcome-screen">
        <h1 className="welcome-title">📱 QR Code Generator</h1>
        <p className="welcome-subtitle">
          Generate QR codes for each hotel room. Guests can scan these codes to instantly access their personal virtual assistant.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header">
          <h2>Generate Room QR Code</h2>
        </div>
        
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Select Room:</label>
            <select
              className="form-control"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {roomNumbers.map((roomNumber) => (
                <option key={roomNumber} value={roomNumber}>
                  Room {roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Base URL:</label>
            <input
              type="text"
              className="form-control"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">QR Code Size:</label>
            <select
              className="form-control"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value))}
            >
              <option value={128}>Small (128px)</option>
              <option value={256}>Medium (256px)</option>
              <option value={512}>Large (512px)</option>
            </select>
          </div>

          <div className="text-center mb-4">
            <div style={{ 
              display: 'inline-block', 
              padding: '20px', 
              background: 'white', 
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <QRCode
                value={qrUrl}
                size={qrSize}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Generated URL:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                value={qrUrl}
                readOnly
              />
              <button
                className="btn btn-secondary"
                onClick={copyUrl}
                title="Copy URL"
              >
                <FiCopy />
              </button>
            </div>
          </div>

          <div className="text-center" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={downloadQR}
            >
              <FiDownload />
              Download QR Code
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={printQR}
            >
              <FiPrinter />
              Print QR Code
            </button>
          </div>
        </div>

        <div className="card-footer">
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <h4>Instructions:</h4>
            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
              <li>Select the room number from the dropdown</li>
              <li>Adjust the base URL if needed (for production, use your domain)</li>
              <li>Choose the QR code size based on your needs</li>
              <li>Download or print the QR code</li>
              <li>Place the QR code in the corresponding hotel room</li>
              <li>Guests can scan the code to access their personal assistant</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        <p style={{ fontSize: '14px' }}>
          💡 Tip: For production use, replace the base URL with your actual domain!
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator; 