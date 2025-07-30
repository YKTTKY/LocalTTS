## Requirements  
- Playback Controls: Add play, pause, and stop functionality for the audio triggered by the context menu’s "Speak Selected Text."
- Save Audio Request: Reuse the generated audio (base64 data) to avoid redundant API calls when resuming playback.
- Integration with AudioPlayer: Update the popup to display and control playback (e.g., show selected text, play/pause/stop buttons, playback status).
- Scope: Focus on context menu TTS and playback controls
- Constraints: Work within Manifest V3 Service Worker limitations (no DOM APIs in background.ts) and maintain TypeScript compatibility.

## Solution Strategy

### Current Flow:

- ```background.ts```: Handles context menu click, makes API requests (/tts, /audio/{filename}), converts audio to base64, and sends playAudio to content.ts.  
- ```content.ts```: Plays audio using an Audio object, cleans up after playback ends.
- ```AudioPlayer.tsx```: Supplementary popup UI, currently idle unless buttons are pressed (optional auto-fetch of selected text).


### Changes Needed:

- Store Audio Data: Cache the base64 audio data in ```background.ts``` (persistent in Service Worker) to reuse for play/pause/stop without new API calls.
- Playback Control Messages: Add messages (pauseAudio, stopAudio) from AudioPlayer (popup) to ```content.ts``` via ```background.ts``` to control the audio.
- Update ```content.ts```: Handle pauseAudio and stopAudio, manage Audio object state (e.g., pause/resume, stop and cleanup).
- Update ```AudioPlayer.tsx```: Add play/pause/stop buttons, display playback status (e.g., “Playing”, “Paused”, “Stopped”), and sync with context menu actions.
Sync Context Menu and Popup: Ensure context menu TTS updates the popup’s status, and popup controls affect the same audio.


### How Playback Control Works

- #### Context Menu:

    - Click “Speak Selected Text”:

        - background.ts checks audioCache. If the text matches, it reuses the cached base64 data; otherwise, it fetches new audio from /tts and /audio/{filename}.
        - Sends playAudio to content.ts, which plays the audio and sets playbackState to playing.


    - Audio is cached in background.ts (audioCache) to avoid redundant API calls.


- #### Popup (AudioPlayer):

    - On open: Auto-fetches selected text and playback state (via getSelectedText and getPlaybackState).
    - Buttons:

        - Play: Sends playTTS to ```background.ts```, which reuses cached audio or fetches new audio, then sends playAudio to ```content.ts```.
        - Pause: Sends pauseAudio to ```background.ts```, forwarded to ```content.ts```, which pauses the Audio object.
        - Stop: Sends stopAudio to ```background.ts```, forwarded to ```content.ts```, which stops and cleans up the Audio object.
        - Refresh Selected Text: Updates the displayed text.


    - Displays selected text and playback status, with buttons disabled appropriately (e.g., Pause disabled unless playing).


- #### Caching: 
    - audioCache in ```background.ts``` stores the latest { text, audioData }, allowing play/pause/resume without new API calls for the same text.
- #### State Sync: 
    - AudioPlayer queries ```background.ts``` (audioCache) and ```content.ts``` (playbackState) to reflect the current state, even if triggered by the context menu.