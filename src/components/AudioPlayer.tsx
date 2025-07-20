import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    getSelectedText(); // Automatically fetch selected text when popup opens
  }, []);

  const speakText = () => {
    if (!selectedText || selectedText === 'No text selected') {
      alert('Please select text on the webpage first.');
      return;
    }
    chrome.runtime.sendMessage({ action: 'playTTS', text: selectedText });
  };

  return (
    <div className="audio-player">
      <h2>Text-to-Speech</h2>
      <p>Selected: {selectedText}</p>
      <button onClick={speakText}>Speak Selected Text</button>
      <button onClick={getSelectedText}>Refresh Selected Text</button>
    </div>
  );
};

export default AudioPlayer;