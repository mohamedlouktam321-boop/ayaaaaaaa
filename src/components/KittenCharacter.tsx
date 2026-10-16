import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/audio';

export type KittenState = 'sad' | 'hopeful' | 'garden' | 'joyful';

interface KittenProps {
  state: KittenState;
  isJumping?: boolean;
  onPet?: () => void;
}

export const KittenCharacter: React.FC<KittenProps> = ({ state, isJumping = false, onPet }) => {
  const [blink, setBlink] = useState(false);
  const [gazeDirection, setGazeDirection] = useState<'down' | 'center'>('down');
  const [isPetted, setIsPetted] = useState(false);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 220);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // In sad mode: alternate looking down and looking up at Aya
  useEffect(() => {
    if (state === 'sad') {
      const gazeTimer = setInterval(() => {
        setGazeDirection((prev) => (prev === 'down' ? 'center' : 'down'));
      }, 4200);
      return () => clearInterval(gazeTimer);
    } else {
      setGazeDirection('center');
    }
  }, [state]);

  const handleInteraction = () => {
    setIsPetted(true);
    soundEngine.playPurr();
    if (onPet) onPet();
    setTimeout(() => setIsPetted(false), 1800);
  };

  // Determine ear rotation
  const leftEarRotate =
    state === 'sad' ? -12 : state === 'hopeful' ? 2 : state === 'garden' ? -2 : 6;
  const rightEarRotate =
    state === 'sad' ? 12 : state === 'hopeful' ? -2 : state === 'garden' ? 2 : -6;

  // Eye pupil offset
  const pupilY = gazeDirection === 'down' && state === 'sad' ? 3 : 0;
  const pupilX = 0;

  return (
    <div
      className="relative flex flex-col items-center justify-center cursor-pointer select-none group"
      onClick={handleInteraction}
      title="Click to gently pet the little kitten 🐾"
    >
      {/* Little floating text when Aya pets kitten */}
      {isPetted && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -25, scale: 1 }}
          exit={{ opacity: 0, y: -40 }}
          className="absolute -top-10 z-30 px-3 py-1 rounded-full bg-pink-500/80 backdrop-blur-md text-white text-xs font-medium shadow-lg shadow-pink-500/20 flex items-center gap-1.5"
        >
          <span>*purrrr*</span>
          <span className="text-[10px]">🤍 Aya</span>
        </motion.div>
      )}

      {/* Floating flower blossom base for Scene 4 & 5 */}
      {(state === 'garden' || state === 'joyful') && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -bottom-6 w-56 h-28 pointer-events-none z-0"
        >
          <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(244,114,182,0.6)]">
            <defs>
              <linearGradient id="lotusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#fb7185" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Outer Petals */}
            <path d="M 20 65 C 10 40 40 25 70 50 C 40 70 20 65 20 65 Z" fill="url(#lotusGrad)" opacity="0.8" />
            <path d="M 180 65 C 190 40 160 25 130 50 C 160 70 180 65 180 65 Z" fill="url(#lotusGrad)" opacity="0.8" />
            <path d="M 45 75 C 30 35 75 20 100 45 C 70 70 45 75 45 75 Z" fill="url(#lotusGrad)" opacity="0.9" />
            <path d="M 155 75 C 170 35 125 20 100 45 C 130 70 155 75 155 75 Z" fill="url(#lotusGrad)" opacity="0.9" />
            {/* Center soft bed */}
            <ellipse cx="100" cy="70" rx="55" ry="18" fill="#fda4af" opacity="0.95" />
            <ellipse cx="100" cy="68" rx="42" ry="12" fill="#fff1f2" opacity="0.8" />
          </svg>
        </motion.div>
      )}

      {/* Main Kitten Motion Container */}
      <motion.div
        animate={
          isJumping
            ? {
                y: [-0, -60, -8, -35, 0],
                rotate: [0, -8, 6, -3, 0],
                scale: [1, 1.15, 0.95, 1.05, 1],
              }
            : state === 'sad'
            ? {
                y: [0, -2, 0, -1.5, 0],
                rotate: [0, -0.6, 0.6, 0],
              }
            : state === 'hopeful'
            ? {
                y: [0, -4, 0],
                rotate: [0, 1, -1, 0],
              }
            : {
                y: [0, -6, 0],
                rotate: [0, 1.5, -1.5, 0],
              }
        }
        transition={
          isJumping
            ? { duration: 1.2, times: [0, 0.35, 0.65, 0.85, 1], ease: 'easeInOut' }
            : { repeat: Infinity, duration: state === 'sad' ? 2.4 : 3.2, ease: 'easeInOut' }
        }
        className="relative z-10 w-48 sm:w-56 md:w-64 aspect-square flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Fur Radiance & 3D Shading Gradients */}
            <radialGradient id="catFurBody" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#fffdfa" />
              <stop offset="45%" stopColor="#f6ede3" />
              <stop offset="85%" stopColor="#e2d4c3" />
              <stop offset="100%" stopColor="#c5b39e" />
            </radialGradient>

            <radialGradient id="catFurHead" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f8f1e8" />
              <stop offset="85%" stopColor="#e4d6c6" />
              <stop offset="100%" stopColor="#c7b5a1" />
            </radialGradient>

            {/* Ear inner gradient */}
            <linearGradient id="catEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
            </linearGradient>

            {/* Huge glossy eye gradient */}
            <radialGradient id="catEyeIris" cx="48%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="85%" stopColor="#020617" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Heart gradient */}
            <radialGradient id="heartGlow" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ff758c" />
              <stop offset="60%" stopColor="#ff416c" />
              <stop offset="100%" stopColor="#c71b4a" />
            </radialGradient>

            {/* Tear drop sparkle filter */}
            <filter id="tearGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Soft Shadow below kitten */}
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
              <stop offset="70%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Ground reflection puddle shadow */}
          <ellipse cx="120" cy="226" rx="60" ry="12" fill="url(#groundShadow)" />

          {/* Kitten Tail */}
          <motion.path
            d="M 68 190 C 40 180 25 150 40 135 C 46 130 54 135 50 146 C 42 165 60 180 75 186 Z"
            fill="url(#catFurBody)"
            stroke="#b8a590"
            strokeWidth="0.8"
            animate={
              state === 'joyful' || isJumping
                ? { rotate: [0, 18, -12, 16, 0] }
                : state === 'sad'
                ? { rotate: [0, -3, 2, -2, 0] }
                : { rotate: [0, 8, -6, 5, 0] }
            }
            transition={{ repeat: Infinity, duration: state === 'sad' ? 3.5 : 2.0, ease: 'easeInOut' }}
            style={{ transformOrigin: '70px 188px' }}
          />

          {/* Kitten Body */}
          <path
            d="M 76 140 C 65 160 62 195 80 216 C 96 226 144 226 160 216 C 178 195 175 160 164 140 C 150 148 90 148 76 140 Z"
            fill="url(#catFurBody)"
            stroke="#c2b09c"
            strokeWidth="1"
          />

          {/* Fluffy Chest / Tummy Patch */}
          <path
            d="M 94 150 C 90 175 92 205 120 215 C 148 205 150 175 146 150 C 134 156 106 156 94 150 Z"
            fill="#ffffff"
            opacity="0.9"
          />

          {/* Paws Resting on Ground (in sad / garden / joyful mode) */}
          {state !== 'hopeful' && (
            <g>
              {/* Back feet */}
              <ellipse cx="78" cy="216" rx="14" ry="9" fill="url(#catFurBody)" stroke="#baa793" strokeWidth="0.8" />
              <ellipse cx="162" cy="216" rx="14" ry="9" fill="url(#catFurBody)" stroke="#baa793" strokeWidth="0.8" />
              {/* Front little paws */}
              <ellipse cx="102" cy="218" rx="11" ry="8" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
              <ellipse cx="138" cy="218" rx="11" ry="8" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
              {/* Toe lines */}
              <line x1="99" y1="215" x2="99" y2="223" stroke="#baa793" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="104" y1="215" x2="104" y2="223" stroke="#baa793" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="135" y1="215" x2="135" y2="223" stroke="#baa793" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="140" y1="215" x2="140" y2="223" stroke="#baa793" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}

          {/* Kitten Head Group */}
          <g>
            {/* Left Ear */}
            <motion.g
              animate={{ rotate: leftEarRotate + (isPetted ? -6 : 0) }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ transformOrigin: '68px 90px' }}
            >
              <path
                d="M 66 92 C 55 58 52 38 72 44 C 88 48 94 72 90 85 Z"
                fill="url(#catFurHead)"
                stroke="#baa793"
                strokeWidth="1"
              />
              <path
                d="M 68 85 C 60 62 60 48 72 52 C 82 56 86 74 84 82 Z"
                fill="url(#catEarInner)"
              />
              {/* Ear fluff tufts */}
              <path d="M 70 78 C 76 74 80 77 82 72" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </motion.g>

            {/* Right Ear */}
            <motion.g
              animate={{ rotate: rightEarRotate + (isPetted ? 6 : 0) }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ transformOrigin: '172px 90px' }}
            >
              <path
                d="M 174 92 C 185 58 188 38 168 44 C 152 48 146 72 150 85 Z"
                fill="url(#catFurHead)"
                stroke="#baa793"
                strokeWidth="1"
              />
              <path
                d="M 172 85 C 180 62 180 48 168 52 C 158 56 154 74 156 82 Z"
                fill="url(#catEarInner)"
              />
              {/* Ear fluff tufts */}
              <path d="M 170 78 C 164 74 160 77 158 72" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </motion.g>

            {/* Head Silhouette - Ultra Adorable round shape with fluffy cheek curves */}
            <path
              d="M 62 108 C 45 130 52 152 75 158 C 90 162 150 162 165 158 C 188 152 195 130 178 108 C 168 95 155 86 120 86 C 85 86 72 95 62 108 Z"
              fill="url(#catFurHead)"
              stroke="#c7b5a1"
              strokeWidth="1"
            />

            {/* Soft pink blush on cheeks */}
            <ellipse
              cx="74"
              cy="134"
              rx="12"
              ry="7"
              fill="#fb7185"
              opacity={state === 'sad' ? 0.35 : 0.65}
            />
            <ellipse
              cx="166"
              cy="134"
              rx="12"
              ry="7"
              fill="#fb7185"
              opacity={state === 'sad' ? 0.35 : 0.65}
            />

            {/* Kitten Eyes */}
            {state === 'joyful' ? (
              // Joyful crescent happy eyes (^ . ^)
              <g>
                <path
                  d="M 80 120 C 86 110 102 110 108 120"
                  stroke="#332a24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 132 120 C 138 110 154 110 160 120"
                  stroke="#332a24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : blink ? (
              // Closed eye blink line
              <g>
                <path
                  d="M 80 122 C 88 128 100 128 108 122"
                  stroke="#3e322b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 132 122 C 140 128 152 128 160 122"
                  stroke="#3e322b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : (
              // Huge glossy anime/Pixar expressive eyes
              <g>
                {/* Left Eye */}
                <g>
                  {/* Outer eye contour */}
                  <ellipse cx="94" cy="120" rx="16" ry="19" fill="#0f172a" />
                  <ellipse cx="94" cy="120" rx="15" ry="18" fill="url(#catEyeIris)" />
                  {/* Iris color ring (ocean emerald / violet reflection) */}
                  <ellipse cx="94" cy="122" rx="12" ry="14" fill="#1e293b" opacity="0.8" />
                  <ellipse
                    cx={94 + pupilX}
                    cy={120 + pupilY}
                    rx="9"
                    ry="11"
                    fill="#020617"
                  />
                  {/* Sparkle Catchlights */}
                  <circle cx="89" cy="113" r="4.8" fill="#ffffff" />
                  <circle cx="98" cy="124" r="2.2" fill="#ffffff" opacity="0.9" />
                  <circle cx="91" cy="126" r="1.2" fill="#ffffff" opacity="0.8" />

                  {/* Watery sad tear glisten on lower rim */}
                  {state === 'sad' && (
                    <path
                      d="M 83 128 C 88 136 102 136 106 128"
                      stroke="#93c5fd"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      opacity="0.85"
                      fill="none"
                    />
                  )}
                </g>

                {/* Right Eye */}
                <g>
                  {/* Outer eye contour */}
                  <ellipse cx="146" cy="120" rx="16" ry="19" fill="#0f172a" />
                  <ellipse cx="146" cy="120" rx="15" ry="18" fill="url(#catEyeIris)" />
                  {/* Iris color ring */}
                  <ellipse cx="146" cy="122" rx="12" ry="14" fill="#1e293b" opacity="0.8" />
                  <ellipse
                    cx={146 + pupilX}
                    cy={120 + pupilY}
                    rx="9"
                    ry="11"
                    fill="#020617"
                  />
                  {/* Sparkle Catchlights */}
                  <circle cx="141" cy="113" r="4.8" fill="#ffffff" />
                  <circle cx="150" cy="124" r="2.2" fill="#ffffff" opacity="0.9" />
                  <circle cx="143" cy="126" r="1.2" fill="#ffffff" opacity="0.8" />

                  {/* Watery sad tear glisten on lower rim */}
                  {state === 'sad' && (
                    <path
                      d="M 134 128 C 139 136 153 136 157 128"
                      stroke="#93c5fd"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      opacity="0.85"
                      fill="none"
                    />
                  )}
                </g>

                {/* Sad Dropping Sparkling Tears in Scene 1 & 2 */}
                {state === 'sad' && (
                  <g>
                    {/* Tear running down left cheek */}
                    <circle
                      cx="90"
                      cy="138"
                      r="2.5"
                      fill="#e0f2fe"
                      filter="url(#tearGlow)"
                      className="animate-[tearDrip_2.8s_ease-in_infinite]"
                    />
                    <circle
                      cx="90"
                      cy="138"
                      r="1.2"
                      fill="#ffffff"
                    />

                    {/* Tear dropping from right cheek */}
                    <circle
                      cx="150"
                      cy="140"
                      r="2.2"
                      fill="#e0f2fe"
                      filter="url(#tearGlow)"
                      className="animate-[tearDrip_3.4s_ease-in_infinite_1.2s]"
                    />
                    <circle
                      cx="150"
                      cy="140"
                      r="1.0"
                      fill="#ffffff"
                    />
                  </g>
                )}
              </g>
            )}

            {/* Cute Tiny Nose */}
            <polygon
              points="117,130 123,130 120,134"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />

            {/* Sad or Smiling Mouth */}
            {state === 'sad' ? (
              // Sad little quavering pout mouth
              <path
                d="M 114 140 C 117 137 120 137 120 135 C 120 137 123 137 126 140"
                stroke="#5c4538"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : state === 'hopeful' ? (
              // Gentle sweet w-mouth
              <path
                d="M 113 137 C 116 140 120 140 120 137 C 120 140 124 140 127 137"
                stroke="#4a3b32"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Happy sweet open smile
              <g>
                <path
                  d="M 112 136 C 116 140 120 140 120 137 C 120 140 124 140 128 136"
                  stroke="#4a3b32"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 116 138 C 117 143 123 143 124 138 Z"
                  fill="#fb7185"
                />
              </g>
            )}

            {/* Delicate Whisker lines */}
            <g opacity="0.65">
              {/* Left whiskers */}
              <line x1="68" y1="133" x2="42" y2="129" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
              <line x1="68" y1="137" x2="40" y2="138" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
              <line x1="69" y1="141" x2="44" y2="147" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
              {/* Right whiskers */}
              <line x1="172" y1="133" x2="198" y2="129" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
              <line x1="172" y1="137" x2="200" y2="138" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
              <line x1="171" y1="141" x2="196" y2="147" stroke="#948575" strokeWidth="1" strokeLinecap="round" />
            </g>
          </g>

          {/* ITEM HELD: Heart with Bandage (Scene 1 & 2) vs Offering Heart (Scene 3) */}
          {(state === 'sad' || state === 'hopeful') && (
            <motion.g
              animate={
                state === 'hopeful'
                  ? {
                      y: [-4, -14, -4],
                      scale: [1, 1.12, 1],
                      filter: [
                        'drop-shadow(0 0 8px rgba(244,114,182,0.6))',
                        'drop-shadow(0 0 20px rgba(244,114,182,0.9))',
                        'drop-shadow(0 0 8px rgba(244,114,182,0.6))',
                      ],
                    }
                  : {
                      y: [0, 2, 0],
                      filter: 'drop-shadow(0 0 6px rgba(244,114,182,0.4))',
                    }
              }
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{ transformOrigin: '120px 175px' }}
            >
              {/* The Little Heart SVG */}
              <path
                d="M 120 186 C 120 186 100 172 100 158 C 100 148 108 142 116 145 C 119 146 120 149 120 149 C 120 149 121 146 124 145 C 132 142 140 148 140 158 C 140 172 120 186 120 186 Z"
                fill="url(#heartGlow)"
                stroke="#fff1f2"
                strokeWidth="1.2"
              />

              {/* Heart Bandage (Cross tape on the sad wounded heart) */}
              {state === 'sad' && (
                <g opacity="0.95">
                  <rect
                    x="110"
                    y="157"
                    width="20"
                    height="5.5"
                    rx="1.5"
                    transform="rotate(25 120 160)"
                    fill="#fed7aa"
                    stroke="#fdba74"
                    strokeWidth="0.6"
                  />
                  <rect
                    x="110"
                    y="157"
                    width="20"
                    height="5.5"
                    rx="1.5"
                    transform="rotate(-25 120 160)"
                    fill="#fed7aa"
                    stroke="#fdba74"
                    strokeWidth="0.6"
                  />
                  {/* Little tiny pinholes on bandage */}
                  <circle cx="116" cy="158" r="0.6" fill="#fb923c" />
                  <circle cx="124" cy="162" r="0.6" fill="#fb923c" />
                </g>
              )}

              {/* Paws holding the heart */}
              {state === 'sad' ? (
                // Little paws clutching heart tight to chest
                <g>
                  <ellipse cx="106" cy="168" rx="7.5" ry="5.5" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
                  <ellipse cx="134" cy="168" rx="7.5" ry="5.5" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
                  <circle cx="106" cy="168" r="2.2" fill="#fbcfe8" />
                  <circle cx="134" cy="168" r="2.2" fill="#fbcfe8" />
                </g>
              ) : (
                // Paws outstretched offering the heart forward to Aya
                <g>
                  <ellipse cx="104" cy="172" rx="8.5" ry="6.5" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
                  <ellipse cx="136" cy="172" rx="8.5" ry="6.5" fill="#ffffff" stroke="#c2b09c" strokeWidth="0.8" />
                  <circle cx="104" cy="172" r="2.5" fill="#f472b6" />
                  <circle cx="136" cy="172" r="2.5" fill="#f472b6" />
                </g>
              )}
            </motion.g>
          )}

          {/* Starlight / Flower Crown on kitten in Scene 5 */}
          {(state === 'garden' || state === 'joyful') && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {/* Little Flower on ear */}
              <circle cx="82" cy="72" r="6" fill="#f472b6" />
              <circle cx="82" cy="72" r="2.5" fill="#fef08a" />
              <circle cx="76" cy="70" r="4" fill="#fda4af" />
              <circle cx="88" cy="70" r="4" fill="#fda4af" />
              <circle cx="78" cy="77" r="4" fill="#fda4af" />
              <circle cx="86" cy="77" r="4" fill="#fda4af" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
