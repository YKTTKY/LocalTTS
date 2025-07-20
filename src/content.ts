console.log('Content script loaded');

let audioRef: HTMLAudioElement | null = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection()?.toString() || '';
    sendResponse({ selectedText });
  } else if (request.action === 'playAudio' && request.audioData) {
    console.log('Received playAudio message, audio data length:', request.audioData.length);
    try {
      if (audioRef) {
        console.log('Cleaning up previous audio');
        audioRef.pause();
        URL.revokeObjectURL(audioRef.src);
        audioRef = null;
      }

      audioRef = new Audio(request.audioData);
      console.log('Audio object created');

      audioRef.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        const error = (e.target as HTMLAudioElement).error;
        console.error('Audio error details:', error?.message, 'code:', error?.code);
        sendResponse({ status: 'error', message: error?.message || 'Audio playback failed' });
      });

      audioRef.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
        if (audioRef) {
          audioRef.play().then(() => {
            console.log('Audio playback started');
            sendResponse({ status: 'audio playing' });
          }).catch((e) => {
            console.error('Play error:', e.name, e.message);
            sendResponse({ status: 'error', message: e.message });
          });
        } else {
          console.error('audioRef is null before play');
          sendResponse({ status: 'error', message: 'Audio reference lost' });
        }
      });

      audioRef.addEventListener('ended', () => {
        console.log('Audio playback ended');
        if (audioRef) {
          URL.revokeObjectURL(audioRef.src);
          audioRef = null;
        }
      });

      audioRef.addEventListener('canplay', () => {
        console.log('Audio can play');
      });
    } catch (error) {
      console.error('Content script audio error:', error);
      sendResponse({ status: 'error', message: String(error) });
    }
  } else if (request.action === 'testMessage') {
    console.log('Test message received');
    sendResponse({ status: 'content script active' });
  }
  return true; // Keep message channel open for async sendResponse
});