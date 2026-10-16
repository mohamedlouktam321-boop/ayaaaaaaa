import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicEnvironmentProps {
  scene: number; // 1 to 5
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  type: 'rain' | 'firefly' | 'petal' | 'heart' | 'trail';
  rotation?: number;
  rotationSpeed?: number;
}

export const CinematicEnvironment: React.FC<CinematicEnvironmentProps> = ({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particle pool
    const particles: Particle[] = [];
    const particleCount = scene <= 2 ? 140 : scene === 3 ? 70 : 80;

    for (let i = 0; i < particleCount; i++) {
      if (scene <= 3) {
        // Rain droplets
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -1.2 + Math.random() * 0.4,
          vy: scene === 3 ? 6 + Math.random() * 4 : 14 + Math.random() * 8,
          size: 1 + Math.random() * 1.5,
          alpha: 0.15 + Math.random() * 0.4,
          maxAlpha: 0.6,
          color: 'rgba(186, 230, 253, ',
          type: 'rain',
        });
      } else {
        // Petals and magical fireflies
        const isPetal = Math.random() > 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.4) * 1.2,
          vy: isPetal ? 0.8 + Math.random() * 1.4 : -0.3 + (Math.random() - 0.5) * 0.6,
          size: isPetal ? 4 + Math.random() * 5 : 1.5 + Math.random() * 2.5,
          alpha: 0.2 + Math.random() * 0.6,
          maxAlpha: 0.8,
          color: isPetal ? 'rgba(251, 113, 133, ' : 'rgba(253, 224, 71, ',
          type: isPetal ? 'petal' : 'firefly',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
        });
      }
    }

    particlesRef.current = particles;

    // Animation Loop
    let lastTime = performance.now();
    const render = (time: number) => {
      // delta timing
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'rain') {
          // Wrap rain
          if (p.y > height) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;

          // Draw rain streak
          ctx.beginPath();
          ctx.strokeStyle = `${p.color}${p.alpha})`;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + (scene === 3 ? 8 : 16));
          ctx.stroke();

          // Small splash at ground
          if (p.y > height - 80 && Math.random() > 0.85) {
            ctx.beginPath();
            ctx.ellipse(p.x, height - 20 + (p.y - height + 80) * 0.2, 4, 1.2, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(224, 242, 254, ${p.alpha * 0.5})`;
            ctx.stroke();
          }
        } else if (p.type === 'petal') {
          // Floating flower petals
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.beginPath();
          // Heart-shaped petal
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'firefly') {
          // Floating fireflies with soft breathing glow
          if (p.y < -20) p.y = height + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          const glow = Math.sin(time * 0.003 + i) * 0.3 + 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * glow})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(253, 224, 71, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Render mouse/touch trail
      const now = performance.now();
      trailRef.current = trailRef.current.filter((t) => now - t.time < 800);
      for (const t of trailRef.current) {
        const age = (now - t.time) / 800; // 0 to 1
        const radius = (1 - age) * 5;
        const alpha = (1 - age) * 0.7;

        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = scene >= 4 ? `rgba(244, 114, 182, ${alpha})` : `rgba(186, 230, 253, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = scene >= 4 ? 'rgba(244, 114, 182, 0.9)' : 'rgba(186, 230, 253, 0.9)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Track mouse / touch trail
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      trailRef.current.push({ x: clientX, y: clientY, time: performance.now() });
      if (trailRef.current.length > 30) trailRef.current.shift();
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scene]);

  // Constellation stars for "AYA" in Scene 5
  // Letter A: (20, 80) -> (45, 20) -> (70, 80) cross (32, 55) -> (58, 55)
  // Letter Y: (85, 20) -> (105, 50) -> (125, 20) stem (105, 50) -> (105, 80)
  // Letter A: (140, 80) -> (165, 20) -> (190, 80) cross (152, 55) -> (178, 55)
  const ayaStars = [
    // A 1
    { x: 20, y: 80 }, { x: 32, y: 55 }, { x: 45, y: 20 }, { x: 58, y: 55 }, { x: 70, y: 80 },
    // Y
    { x: 85, y: 20 }, { x: 95, y: 35 }, { x: 105, y: 50 }, { x: 115, y: 35 }, { x: 125, y: 20 }, { x: 105, y: 65 }, { x: 105, y: 80 },
    // A 2
    { x: 140, y: 80 }, { x: 152, y: 55 }, { x: 165, y: 20 }, { x: 178, y: 55 }, { x: 190, y: 80 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Sky Gradient Background */}
      <motion.div
        animate={{
          background:
            scene <= 2
              ? 'linear-gradient(to bottom, #050616 0%, #0c0d29 45%, #181534 85%, #100f24 100%)'
              : scene === 3
              ? 'linear-gradient(to bottom, #080922 0%, #13143c 50%, #201740 85%, #14112c 100%)'
              : scene === 4
              ? 'linear-gradient(to bottom, #090c2a 0%, #1c1444 45%, #2e184c 75%, #1f113a 100%)'
              : 'linear-gradient(to bottom, #0b0728 0%, #231145 40%, #3e1654 75%, #241038 100%)',
        }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
        className="absolute inset-0"
      />

      {/* Magical Nebula Clouds in Scene 4 & 5 */}
      <AnimatePresence>
        {scene >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-pink-500/15 blur-[120px] animate-pulse-glow" />
            <div className="absolute top-1/6 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[130px]" />
            <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-fuchsia-400/10 blur-[100px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distant City Skyline Silhouette with soft glowing windows (Scene 1-3) */}
      <motion.div
        animate={{ opacity: scene <= 3 ? 0.45 : 0.15 }}
        transition={{ duration: 1.8 }}
        className="absolute bottom-16 left-0 right-0 h-44 pointer-events-none flex items-end justify-center"
      >
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
          {/* Skyline buildings */}
          <path
            d="M 0 200 L 0 160 L 50 160 L 50 140 L 90 140 L 90 180 L 140 180 L 140 110 L 190 110 L 190 150 L 240 150 L 240 130 L 290 130 L 290 170 L 340 170 L 340 100 L 370 100 L 370 70 L 390 70 L 390 100 L 420 100 L 420 160 L 480 160 L 480 120 L 530 120 L 530 180 L 600 180 L 600 90 L 630 60 L 660 90 L 660 180 L 720 180 L 720 130 L 780 130 L 780 150 L 830 150 L 830 110 L 880 110 L 880 170 L 940 170 L 940 140 L 990 140 L 990 160 L 1050 160 L 1050 120 L 1100 120 L 1100 150 L 1150 150 L 1150 170 L 1200 170 L 1200 200 Z"
            fill="#080a1c"
          />
          {/* Soft Amber Glowing Window dots */}
          <g fill="#fde68a" opacity="0.6">
            <rect x="155" y="125" width="4" height="6" rx="1" />
            <rect x="170" y="140" width="4" height="6" rx="1" />
            <rect x="355" y="115" width="4" height="5" rx="1" />
            <rect x="355" y="130" width="4" height="5" rx="1" />
            <rect x="440" y="140" width="4" height="6" rx="1" />
            <rect x="615" y="110" width="5" height="7" rx="1" />
            <rect x="640" y="125" width="5" height="7" rx="1" />
            <rect x="740" y="145" width="4" height="6" rx="1" />
            <rect x="850" y="125" width="4" height="5" rx="1" />
            <rect x="960" y="150" width="4" height="6" rx="1" />
            <rect x="1070" y="135" width="4" height="5" rx="1" />
          </g>
        </svg>
      </motion.div>

      {/* Giant Glowing Moon */}
      <motion.div
        animate={{
          scale: scene >= 4 ? 1.15 : 1,
          opacity: scene === 1 ? 0.75 : scene >= 4 ? 0.98 : 0.85,
          y: scene >= 4 ? 0 : 15,
        }}
        transition={{ duration: 2 }}
        className="absolute top-10 sm:top-14 right-8 sm:right-24 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 pointer-events-none"
      >
        {/* Soft Moon Glow Aura */}
        <div
          className={`absolute inset-0 rounded-full blur-[45px] transition-all duration-1000 ${
            scene >= 4 ? 'bg-pink-300/35' : 'bg-blue-200/25'
          }`}
        />

        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_35px_rgba(255,255,255,0.45)]">
          <defs>
            <radialGradient id="moonGrad" cx="38%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#fdfbf7" />
              <stop offset="85%" stopColor="#e8e5dc" />
              <stop offset="100%" stopColor="#cfc9bc" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#moonGrad)" />
          {/* Subtle Craters */}
          <circle cx="34" cy="38" r="6" fill="#ded8cc" opacity="0.45" />
          <circle cx="56" cy="42" r="8" fill="#ded8cc" opacity="0.35" />
          <circle cx="68" cy="62" r="5" fill="#ded8cc" opacity="0.4" />
          <circle cx="42" cy="68" r="7" fill="#ded8cc" opacity="0.3" />
        </svg>

        {/* Thin passing translucent cloud */}
        <motion.div
          animate={{ x: [-80, 140] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
          className="absolute top-1/2 -left-12 w-48 h-8 rounded-full bg-slate-900/40 blur-[8px] pointer-events-none"
        />
      </motion.div>

      {/* SCENE 5 SPECIAL: Constellation "AYA" in Glowing Starlight */}
      <AnimatePresence>
        {scene === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 w-72 sm:w-96 md:w-[460px] h-36 sm:h-44 pointer-events-none z-10"
          >
            {/* Ambient glow behind constellation */}
            <div className="absolute inset-0 bg-pink-500/10 blur-[50px] rounded-full" />

            <svg viewBox="0 0 210 100" className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
              {/* Constellation Lines */}
              {/* Letter A */}
              <line x1="20" y1="80" x2="45" y2="20" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="45" y1="20" x2="70" y2="80" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="32" y1="55" x2="58" y2="55" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Letter Y */}
              <line x1="85" y1="20" x2="105" y2="50" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="125" y1="20" x2="105" y2="50" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="105" y1="50" x2="105" y2="80" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Letter A */}
              <line x1="140" y1="80" x2="165" y2="20" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="165" y1="20" x2="190" y2="80" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="152" y1="55" x2="178" y2="55" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Constellation Star Nodes */}
              {ayaStars.map((s, idx) => (
                <g key={idx} className="animate-star-twinkle" style={{ animationDelay: `${(idx * 0.2) % 3}s` }}>
                  {/* Star glow */}
                  <circle cx={s.x} cy={s.y} r="4" fill="#f472b6" opacity="0.4" />
                  {/* Star center */}
                  <circle cx={s.x} cy={s.y} r="2" fill="#ffffff" />
                  {/* Star 4-point sparkle cross */}
                  <line x1={s.x - 4} y1={s.y} x2={s.x + 4} y2={s.y} stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
                  <line x1={s.x} y1={s.y - 4} x2={s.x} y2={s.y + 4} stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
                </g>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wet Ground / Magical Meadow Layer at Bottom */}
      <motion.div
        animate={{
          background:
            scene <= 3
              ? 'linear-gradient(to top, #03040c 0%, #080918 60%, rgba(12, 14, 34, 0) 100%)'
              : 'linear-gradient(to top, #090618 0%, #170d2b 50%, rgba(29, 14, 52, 0) 100%)',
        }}
        transition={{ duration: 2 }}
        className="absolute bottom-0 left-0 right-0 h-36 sm:h-44 pointer-events-none"
      >
        {/* Water puddle moon reflection (in scenes 1-3) */}
        {scene <= 3 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-12 bg-blue-300/5 rounded-full blur-[8px] animate-pulse" />
        )}

        {/* Magical Glowing Garden Flowers & Grass (in scenes 4-5) */}
        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8 }}
              className="absolute bottom-0 inset-x-0 h-28 flex items-end justify-around px-4 pointer-events-none"
            >
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center opacity-85"
                  style={{
                    transform: `scale(${0.65 + (i % 4) * 0.15}) translateY(${((i * 7) % 15)}px)`,
                  }}
                >
                  {/* Glowing Flower Head */}
                  <div className="w-4 h-4 rounded-full bg-pink-400/90 shadow-[0_0_12px_rgba(244,114,182,0.9)] animate-pulse" />
                  {/* Stem */}
                  <div className="w-0.5 h-10 bg-emerald-600/50" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing Butterflies (in scenes 4-5) */}
        <AnimatePresence>
          {scene >= 4 && (
            <>
              <div className="absolute bottom-32 left-[20%] animate-butterfly">
                <svg viewBox="0 0 40 40" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(244,114,182,0.9)]">
                  <path d="M 20 20 C 10 5 0 10 5 25 C 10 32 18 25 20 20 Z" fill="#f472b6" opacity="0.85" />
                  <path d="M 20 20 C 30 5 40 10 35 25 C 30 32 22 25 20 20 Z" fill="#f472b6" opacity="0.85" />
                  <circle cx="20" cy="20" r="1.5" fill="#fdf2f8" />
                </svg>
              </div>
              <div className="absolute bottom-40 right-[25%] animate-butterfly" style={{ animationDelay: '3.5s' }}>
                <svg viewBox="0 0 40 40" className="w-6 h-6 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]">
                  <path d="M 20 20 C 10 5 0 10 5 25 C 10 32 18 25 20 20 Z" fill="#c084fc" opacity="0.85" />
                  <path d="M 20 20 C 30 5 40 10 35 25 C 30 32 22 25 20 20 Z" fill="#c084fc" opacity="0.85" />
                  <circle cx="20" cy="20" r="1.5" fill="#fdf2f8" />
                </svg>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* High-performance Dynamic Canvas for Rain, Fireflies, Petals & Cursor Trail */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
