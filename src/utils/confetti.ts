import confetti from 'canvas-confetti';

export const triggerHeartShower = () => {
  // Center gentle burst of hearts
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#f472b6', '#fb7185', '#fda4af', '#f43f5e', '#ffffff'],
    shapes: ['circle'],
    scalar: 1.2,
    ticks: 200,
  });

  // Left and Right fountain burst
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.7 },
      colors: ['#f472b6', '#e879f9', '#ffffff', '#fed7aa'],
      ticks: 250,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.7 },
      colors: ['#f472b6', '#e879f9', '#ffffff', '#fed7aa'],
      ticks: 250,
    });
  }, 250);
};
