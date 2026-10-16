import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ChevronRight, Flower2 } from 'lucide-react';
import { KittenCharacter, KittenState } from './components/KittenCharacter';
import { CinematicEnvironment } from './components/CinematicEnvironment';
import { AudioToggle } from './components/AudioToggle';
import { SceneNavigation } from './components/SceneNavigation';
import { soundEngine } from './utils/audio';
import { triggerHeartShower } from './utils/confetti';

export default function App() {
  const [scene, setScene] = useState<number>(1);
  const [initialFadeIn, setInitialFadeIn] = useState<boolean>(true);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [smileSent, setSmileSent] = useState<boolean>(false);
  const [flashLightWave, setFlashLightWave] = useState<boolean>(false);
  const [revealedLinesCount, setRevealedLinesCount] = useState<number>(0);

  // Initial cinematic fade-in from pure darkness
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialFadeIn(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scene 2: Line by line reveal timer
  const apologyLines = [
    'Hey Aya... 🥺',
    'I know I messed up…',
    'I\'m really sorry, Aya. ❤️',
    'Sometimes words cannot explain what\'s in my heart, but I want you to know that you truly matter to me.',
    'I can\'t undo my mistakes, but I can sincerely apologize and try to do better.',
  ];

  useEffect(() => {
    if (scene === 2) {
      setRevealedLinesCount(0);
      const timeouts: NodeJS.Timeout[] = [];
      apologyLines.forEach((_, idx) => {
        const t = setTimeout(() => {
          setRevealedLinesCount(idx + 1);
        }, (idx + 1) * 1100);
        timeouts.push(t);
      });
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [scene]);

  // Handle Scene Transitions
  const handleNextFromScene1 = () => {
    soundEngine.playChime();
    setScene(2);
  };

  const handleGiveHug = () => {
    soundEngine.playChime();
    setScene(3);
  };

  const handleOpenHeart = () => {
    soundEngine.playBloomSound();
    setFlashLightWave(true);
    setTimeout(() => {
      setScene(4);
      setFlashLightWave(false);
    }, 850);
  };

  const handleGoToStarlight = () => {
    soundEngine.playChime();
    setScene(5);
  };

  const handleSendSmile = () => {
    if (smileSent) return;
    setSmileSent(true);
    setIsJumping(true);
    soundEngine.playCelebration();
    triggerHeartShower();

    setTimeout(() => {
      setIsJumping(false);
    }, 1800);
  };

  const handleReplay = () => {
    soundEngine.playChime();
    setSmileSent(false);
    setIsJumping(false);
    setScene(1);
    setInitialFadeIn(true);
    setTimeout(() => setInitialFadeIn(false), 800);
  };

  // Determine kitten visual state
  const getKittenState = (): KittenState => {
    if (scene <= 2) return 'sad';
    if (scene === 3) return 'hopeful';
    if (scene === 4) return 'garden';
    return smileSent ? 'joyful' : 'garden';
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-pink-500/20 text-slate-100 font-sans">
      {/* Cinematic Environment Background */}
      <CinematicEnvironment scene={scene} />

      {/* Screen flash light wave when opening the heart in Scene 4 */}
      <AnimatePresence>
        {flashLightWave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85 }}
            className="fixed inset-0 z-50 pointer-events-none bg-gradient-to-r from-pink-400 via-rose-300 to-purple-500 mix-blend-screen"
          />
        )}
      </AnimatePresence>

      {/* Initial cinematic black fade overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: initialFadeIn ? 1 : 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className={`fixed inset-0 z-40 bg-black pointer-events-none ${
          initialFadeIn ? 'block' : 'hidden'
        }`}
      />

      {/* Top Header / Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto w-full">
        {/* Brand/Dedication Wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold tracking-wide text-pink-200/90 font-serif">
            For Aya
          </span>
          <span className="text-xs text-pink-400/80">❤️</span>
        </div>

        {/* Scene Navigation Stepper */}
        <div className="hidden sm:block">
          <SceneNavigation
            currentScene={scene}
            onSelectScene={(s) => {
              soundEngine.playChime();
              setScene(s);
            }}
            onReplay={handleReplay}
          />
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-2">
          <AudioToggle currentScene={scene} />
        </div>
      </header>

      {/* Mobile Scene Stepper Bar */}
      <div className="sm:hidden relative z-30 px-4 py-1 flex justify-center w-full">
        <SceneNavigation
          currentScene={scene}
          onSelectScene={(s) => {
            soundEngine.playChime();
            setScene(s);
          }}
          onReplay={handleReplay}
        />
      </div>

      {/* Main Interactive Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 max-w-4xl mx-auto w-full">
        {/* ===================== SCENE 1: THE SAD LITTLE KITTEN ===================== */}
        {scene === 1 && (
          <motion.div
            key="scene-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1.0 }}
            className="flex flex-col items-center text-center space-y-6 max-w-md w-full"
          >
            {/* Ambient Title */}
            <div className="space-y-2">
              <span className="text-xs tracking-widest text-pink-300/80 uppercase font-medium">
                Mohamed waiting for Aya
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-pink-100 tracking-tight leading-snug">
                Salam aya l3ziza wakha tsm3ini bit ndwi m3ak
              </h1>
            </div>

            {/* Kitten Character in Rain */}
            <div className="py-2">
              <KittenCharacter state="sad" />
            </div>

            {/* Poetic Whisper */}
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-sm">
              It’s quiet in the rain. Mohamed is waiting here holding a fragile heart with a bandage... hoping you will listen.
            </p>

            {/* Interaction Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(244, 114, 182, 0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNextFromScene1}
              type="button"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/80 to-rose-500/80 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm shadow-lg shadow-pink-500/25 border border-pink-300/30 transition-all duration-300"
            >
              <span>Listen to what he wants to say</span>
              <ChevronRight className="w-4 h-4 text-pink-100" />
            </motion.button>
          </motion.div>
        )}

        {/* ===================== SCENE 2: THE APOLOGY LETTER ===================== */}
        {scene === 2 && (
          <motion.div
            key="scene-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-6 max-w-lg w-full"
          >
            {/* Kitten illustration */}
            <div className="scale-90 sm:scale-100">
              <KittenCharacter state="sad" />
            </div>

            {/* Animated text lines appearing sequentially */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full space-y-4 text-left border border-white/10 shadow-2xl">
              <div className="space-y-3">
                {apologyLines.map((line, index) => {
                  const isVisible = index < revealedLinesCount;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={
                        isVisible
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -10 }
                      }
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className={`text-sm sm:text-base leading-relaxed ${
                        index === 0
                          ? 'font-serif text-lg sm:text-xl font-bold text-pink-200'
                          : index === 2
                          ? 'font-medium text-rose-300'
                          : index === apologyLines.length - 1
                          ? 'font-medium text-pink-100 pt-2 border-t border-white/5'
                          : 'text-slate-300'
                      }`}
                    >
                      {line}
                    </motion.div>
                  );
                })}
              </div>

              {/* Go next Button */}
              <AnimatePresence>
                {revealedLinesCount >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="pt-4 flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(244, 114, 182, 0.5)' }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleGiveHug}
                      type="button"
                      className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-medium text-sm shadow-xl shadow-pink-500/30 border border-pink-200/40 animate-pulse-glow"
                    >
                      <span>Go next</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ===================== SCENE 3: THE KITTEN'S JOURNEY ===================== */}
        {scene === 3 && (
          <motion.div
            key="scene-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-6 max-w-lg w-full"
          >
            {/* Glowing floating heart above kitten */}
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-400/40 text-pink-200 text-xs shadow-[0_0_20px_rgba(244,114,182,0.4)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>The little heart is glowing for Aya</span>
            </motion.div>

            {/* Kitten walking forward & offering heart */}
            <motion.div
              initial={{ y: 25, scale: 0.9 }}
              animate={{ y: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="py-1"
            >
              <KittenCharacter state="hopeful" />
            </motion.div>

            {/* Journey Narrative Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-7 w-full text-center space-y-4 border border-white/10 shadow-2xl">
              <p className="text-sm sm:text-base text-pink-100 font-light leading-relaxed">
                “Aya, this little heart is carrying something important... a sincere apology, a little affection, and the hope that someday we can smile again. ❤️”
              </p>

              <div className="pt-2 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(244, 114, 182, 0.6)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleOpenHeart}
                  type="button"
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white font-medium text-sm shadow-xl shadow-pink-500/35 border border-pink-100/50 transition-all duration-300"
                >
                  <Flower2 className="w-4 h-4 text-pink-100" />
                  <span>Open the little heart 💗</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== SCENE 4: THE MAGICAL TRANSFORMATION ===================== */}
        {scene === 4 && (
          <motion.div
            key="scene-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center text-center space-y-6 max-w-xl w-full"
          >
            {/* Kitten nestled peacefully in a magical flower blossom */}
            <div className="relative">
              <KittenCharacter state="garden" />
            </div>

            {/* The Heartfelt Personal Letter */}
            <div className="glass-panel rounded-3xl p-6 sm:p-9 w-full text-left space-y-4 border border-pink-300/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-pink-200">
                  Dear Aya,
                </h2>
                <span className="text-xs text-pink-300/80 font-mono tracking-wider">
                  With sincerity
                </span>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-100 leading-relaxed font-light">
                <p>
                  i m sorry aya wlah ma9sdt n9l9k khososan o nti mrida db o ila kan ay haja bghiti tgoli lia ndirha bach tsam7ini ana ndirha , o 3afak matkhlich lchitan tri9 binatna ana wlh ta nadm 3la dakchi li drt o ma7mltch tchofi 3lia chi haja hakak ama bnisba ldak lcomment wlh ma ana li ktbto wlkn hadchi makay3nich maghltch fdakchi lakhr sm7ilia bzf o kan3tadr bzf
                </p>
                <p className="text-pink-200/95 font-medium pt-1">
                  Take all ur time you need. i know i messed up just forgive me o ila mabitich db ila momkin hir tmnini 3lik o goli lia wach mat9stich bta haja khayba? ❤️
                </p>
              </div>

              {/* Proceed to Scene 5 Button */}
              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(244, 114, 182, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoToStarlight}
                  type="button"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-pink-200 text-xs sm:text-sm font-medium border border-pink-400/30 backdrop-blur-md transition-all"
                >
                  <span>Look up at the stars ✨</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== SCENE 5: THE FINAL LEGENDARY MOMENT ===================== */}
        {scene === 5 && (
          <motion.div
            key="scene-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.0 }}
            className="flex flex-col items-center text-center space-y-6 max-w-xl w-full"
          >
            {/* Giant Glowing Heart in Canopy */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                filter: [
                  'drop-shadow(0 0 15px rgba(244,114,182,0.5))',
                  'drop-shadow(0 0 35px rgba(244,114,182,0.85))',
                  'drop-shadow(0 0 15px rgba(244,114,182,0.5))',
                ],
              }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="text-pink-400"
            >
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 fill-pink-500/80" />
            </motion.div>

            {/* Kitten Happy Jumping / Celebrating */}
            <div className="py-1">
              <KittenCharacter
                state={smileSent ? 'joyful' : 'garden'}
                isJumping={isJumping}
                onPet={() => {
                  triggerHeartShower();
                }}
              />
            </div>

            {/* Grand Dedication Typography */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 w-full text-center space-y-4 border border-pink-300/20 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1.5"
              >
                <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wider text-pink-100 flex items-center justify-center gap-2">
                  <span>AYA</span>
                  <span className="text-pink-400 text-2xl sm:text-3xl">❤️</span>
                </h1>
                <p className="text-base sm:text-lg font-serif italic text-pink-200">
                  “I'm sorry, little sunshine.”
                </p>
              </motion.div>

              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-md mx-auto">
                Made with a little regret, a lot of affection, and Mohamed who hopes to make you smile. ❤️
              </p>

              {/* Final Interactive Action: Send a Little Smile */}
              <div className="pt-3 flex flex-col items-center gap-3">
                {!smileSent ? (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(244, 114, 182, 0.7)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendSmile}
                    type="button"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-pink-500/40 border border-pink-100/50 animate-pulse-glow"
                  >
                    <span>Send a little smile 😊</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-500/25 border border-pink-400/40 text-pink-100 text-sm font-medium shadow-[0_0_20px_rgba(244,114,182,0.4)]">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Even one little smile from you would make this moment brighter. ❤️</span>
                    </div>

                    <p className="text-[12px] text-slate-400 font-light">
                      No expectations, no pressure at all, Aya. Take all the time in the world.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Gentle Footer */}
      <footer className="relative z-20 py-4 px-4 text-center">
        <p className="text-[11px] text-slate-500/80 font-light tracking-wide">
          Click the little kitten anytime to gently pet it 🐾 · Created with sincere warmth for Aya from Mohamed
        </p>
      </footer>
    </div>
  );
}
