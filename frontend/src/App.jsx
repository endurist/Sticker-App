import { useState } from 'react';
import axios from 'axios';
import Printer from './components/Printer';
import StickerCanvas from './components/StickerCanvas';
import './App.css';

function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSticker, setCurrentSticker] = useState(null);
  const [pendingSticker, setPendingSticker] = useState(null); // Sticker waiting to be added to collection
  const [transferring, setTransferring] = useState(false); // Show transfer animation
  const [stickers, setStickers] = useState([]); // Array of all generated stickers

  const handleGenerate = async () => {
    if (!city) return;
    setLoading(true);
    setCurrentSticker(null); // Reset current view
    setPendingSticker(null); // Reset pending sticker

    try {
      console.log("Frontend: Starting generation for city:", city);
      // 1. Call Python Backend
      const apiUrl = 'https://sticker-backend-255707635938.us-central1.run.app';
      console.log("Frontend: Making axios request to", apiUrl + '/generate');
      const response = await axios.post(apiUrl + '/generate', {
        city: city
      });
      console.log("Frontend: Axios request completed successfully");

      console.log("Frontend: Received response:", response);
      console.log("Frontend: Response data:", response.data);

      const newStickerUrl = response.data.image;
      console.log("Frontend: New sticker URL:", newStickerUrl);

      // 2. Show in Printer with animation
      setCurrentSticker(newStickerUrl);
      setPendingSticker(newStickerUrl); // Mark as pending for collection

      console.log("Frontend: Sticker set in state");

    } catch (error) {
      console.error("Frontend: Error generating:", error);
      console.error("Frontend: Error details:", error.response?.data, error.message);
      alert("Failed to connect to backend. Is Python running on port 8000?");
    }
    setLoading(false);
  };

  const handleStickerReady = () => {
    console.log("App: handleStickerReady called", { pendingSticker: !!pendingSticker });
    if (pendingSticker) {
      console.log("App: Adding sticker to collection");
      setTransferring(true); // Show transfer animation

      // Small delay before adding to collection for smooth transition
      setTimeout(() => {
        console.log("App: Actually adding sticker to collection now");
        // 3. Add to Canvas after printer animation completes
        setStickers((prev) => [
          ...prev,
          {
            url: pendingSticker,
            x: 100 + (prev.length * 30), // Slight offset for each new one
            y: 100 + (prev.length * 30),
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          }
        ]);
        setPendingSticker(null); // Clear pending sticker
        setTransferring(false); // Hide transfer animation
        console.log("App: Sticker added to collection successfully");
      }, 800);
    } else {
      console.log("App: No pending sticker to add");
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>City Sticker Gen 🏙️</h1>
      </header>

      <div className="control-panel">
        <input 
          type="text" 
          placeholder="Enter a City (e.g., Tokyo, Paris)" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Printing..." : "PRINT"}
        </button>
      </div>

      {/* The Printer Section */}
      <Printer
        stickerImage={currentSticker}
        loading={loading}
        onStickerReady={handleStickerReady}
      />

      {/* The Canvas Section */}
      <StickerCanvas
        stickers={stickers}
        onStickersChange={setStickers}
        transferring={transferring}
      />

      {/* Debug button - remove this later */}
      {pendingSticker && (
        <button
          onClick={handleStickerReady}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            padding: '10px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          DEBUG: Add to Collection
        </button>
      )}
    </div>
  );
}

export default App;