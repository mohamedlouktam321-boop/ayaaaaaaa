import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AudioToggleProps {
  currentScene: number;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ currentScene }) => {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    soundEngine.setScene(currentScene);
  }, [currentScene]);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
    if (!nextState) {
      soundEngine.playChime();
    }
  };

  return (
    <button
      onClick={toggleSound}
      type="button"
      className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-lg shadow-black/20"
      title={isMuted ? "Turn sound on (lullaby & rain)" : "Mute sound"}
      aria-label="Toggle sound"
    >
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-300 transition-colors" />
      ) : (
        <div className="flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span className="flex items-end gap-0.5 h-2.5">
            <span className="w-0.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )}
      <span className="hidden sm:inline text-[11px] tracking-wide">
        {isMuted ? 'Music Off' : 'Gentle Lullaby'}
      </span>
    </button>
  );
};
