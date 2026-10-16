import React from 'react';
import { RotateCcw } from 'lucide-react';

interface SceneNavigationProps {
  currentScene: number;
  onSelectScene: (scene: number) => void;
  onReplay: () => void;
}

const SCENE_TITLES = [
  { id: 1, label: 'The Rain' },
  { id: 2, label: 'The Apology' },
  { id: 3, label: 'The Hug' },
  { id: 4, label: 'The Garden' },
  { id: 5, label: 'Starlight' },
];

export const SceneNavigation: React.FC<SceneNavigationProps> = ({
  currentScene,
  onSelectScene,
  onReplay,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
      {SCENE_TITLES.map((s) => {
        const isActive = currentScene === s.id;
        const isPassed = currentScene > s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectScene(s.id)}
            type="button"
            className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${
              isActive
                ? 'bg-pink-500/25 text-pink-200 border border-pink-400/40 shadow-[0_0_12px_rgba(244,114,182,0.3)]'
                : isPassed
                ? 'text-slate-300 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isActive
                  ? 'bg-pink-400 scale-125'
                  : isPassed
                  ? 'bg-slate-400'
                  : 'bg-slate-700'
              }`}
            />
            <span className="hidden md:inline">{s.label}</span>
            <span className="md:hidden">{s.id}</span>
          </button>
        );
      })}

      <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

      <button
        onClick={onReplay}
        type="button"
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        title="Replay from the start"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="hidden sm:inline">Replay</span>
      </button>
    </div>
  );
};
