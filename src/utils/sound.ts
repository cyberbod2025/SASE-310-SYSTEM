// Utility for generating interface sounds using Web Audio API
// This avoids external dependencies or assets

const audioCtx = new (
  window.AudioContext || (window as any).webkitAudioContext
)();

export const playAlertSound = () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  oscillator.frequency.exponentialRampToValueAtTime(
    880,
    audioCtx.currentTime + 0.1,
  ); // Slide up to A5

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
};

export const playSuccessSound = () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
};

export const playClickSound = () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playNotificationSound = () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const first = audioCtx.createOscillator();
  const second = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  first.type = "triangle";
  second.type = "sine";
  first.frequency.setValueAtTime(659.25, audioCtx.currentTime);
  second.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.08);

  gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);

  first.connect(gainNode);
  second.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  first.start(audioCtx.currentTime);
  first.stop(audioCtx.currentTime + 0.22);
  second.start(audioCtx.currentTime + 0.08);
  second.stop(audioCtx.currentTime + 0.42);
};
