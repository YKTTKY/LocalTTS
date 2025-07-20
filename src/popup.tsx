import React from 'react';
import { createRoot } from 'react-dom/client';
import AudioPlayer from './components/AudioPlayer';
import './index.css';

const App: React.FC = () => {
  return (
    <AudioPlayer/>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);