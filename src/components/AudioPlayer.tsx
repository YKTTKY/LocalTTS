import React, { useState } from 'react';

const AudioPlayer: React.FC = () => {
  
  const [selectedText, setSelectedText] = useState<string>('');

  const getSelectedText = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'getSelectedText' },
        (response) => {
          if (response?.selectedText) {
            setSelectedText(response.selectedText);
          } else {
            setSelectedText('No text selected');
          }
        }
      );
    }
  };

  const speakText = async () => {  
    if (!selectedText || selectedText === 'No text selected') {  
      alert('Please select text on the webpage first.');  
      return;  
    }  
    
    try {  
      const formData = new FormData();  
      formData.append('text', selectedText);  
    
      // Step 1: Generate TTS and get filename  
      const response = await fetch('http://127.0.0.1:8000/tts', {  
        method: 'POST',  
        body: formData,  
      });  
    
      if (!response.ok) {  
        throw new Error('TTS request failed');  
      }  
    
      const data = await response.json(); // This returns {filename: "tts_uuid.wav"}  
        
      // Step 2: Fetch the actual audio file  
      const audioResponse = await fetch(`http://127.0.0.1:8000/audio/${data.filename}`);  
        
      if (!audioResponse.ok) {  
        throw new Error('Failed to fetch audio file');  
      }  
        
      const audioBlob = await audioResponse.blob();  
      const audioUrl = URL.createObjectURL(audioBlob);  
      const audio = new Audio(audioUrl);  
      audio.play();  
        
    } catch (error) {  
      console.error('TTS error:', error);  
      alert('Failed to generate speech. Ensure the local TTS server is running at http://127.0.0.1:8000.');  
    }  
  };

  return (
    <div className='audio-player'>
      <div className="tts-section">
        <h2>Text-to-Speech</h2>
        <button onClick={getSelectedText}>Get Selected Text</button>
        <p>Selected: {selectedText}</p>
        <button onClick={speakText}>Speak Selected Text</button>
      </div>
    </div>
  );
};

export default AudioPlayer;