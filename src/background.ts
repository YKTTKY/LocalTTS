try {
    console.log('Background script initialized');
  
    chrome.contextMenus.create({
      id: "speak-text",
      title: "Speak Selected Text",
      contexts: ["selection"],
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Context menu creation error:', chrome.runtime.lastError.message);
      } else {
        console.log('Context menu created successfully');
      }
    });
  
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      console.log('Context menu clicked:', info);
      if (info.menuItemId === "speak-text" && info.selectionText && tab?.id) {
        console.log('Tab ID:', tab.id, 'URL:', tab.url);
        // Check if content script can run in this tab
        if (tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
          console.log('Triggering TTS for text:', info.selectionText);
          playTTS(info.selectionText, tab.id);
        } else {
          console.error('Cannot run content script in this tab:', tab.url);
        }
      } else {
        console.log('No text selected or invalid tab');
      }
    });
  
    async function playTTS(text: string, tabId: number) {
      if (!text) {
        console.error('No text provided for TTS');
        return;
      }
      console.log('playTTS called with text:', text);
      try {
        const formData = new FormData();
        formData.append('text', text);
  
        console.log('Sending POST /tts request');
        const ttsResponse = await fetch('http://127.0.0.1:8000/tts', {
          method: 'POST',
          body: formData,
        });
  
        if (!ttsResponse.ok) {
          throw new Error(`TTS request failed: ${ttsResponse.status} ${ttsResponse.statusText}`);
        }
  
        const ttsData = await ttsResponse.json();
        const filename = ttsData.filename;
        if (!filename) {
          throw new Error('No filename returned from /tts');
        }
  
        console.log('TTS Response:', ttsData);
  
        console.log('Fetching audio from /audio/' + filename);
        const audioResponse = await fetch(`http://127.0.0.1:8000/audio/${filename}`);
        if (!audioResponse.ok) {
          throw new Error(`Audio request failed: ${audioResponse.status} ${audioResponse.statusText}`);
        }
  
        const contentType = audioResponse.headers.get('Content-Type');
        console.log('Audio Response Content-Type:', contentType);
  
        if (!contentType || !contentType.includes('audio/wav')) {
          throw new Error('Invalid response: Expected audio/wav, got ' + contentType);
        }
  
        const audioBlob = await audioResponse.blob();
        console.log('Audio Blob size:', audioBlob.size, 'type:', audioBlob.type);
  
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          console.log('Audio blob converted to base64, length:', base64data.length);
          console.log('Base64 sample:', base64data.substring(0, 50));
  
          chrome.tabs.sendMessage(tabId, {
            action: 'playAudio',
            audioData: base64data,
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending playAudio message:', chrome.runtime.lastError.message);
              console.error('Ensure content script is loaded in tab ID:', tabId);
            } else {
              console.log('playAudio message sent successfully:', response);
            }
          });
        };
        reader.onerror = () => {
          console.error('Error converting blob to base64:', reader.error);
        };
      } catch (error) {
        console.error('TTS error:', error);
      }
    }
  } catch (error) {
    console.error('Background script error:', error);
  }