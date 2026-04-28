import React, { useState, useRef, useEffect } from "react";

interface IntroPlayerProps {
  onComplete: () => void;
}

export const IntroPlayer: React.FC<IntroPlayerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn(
          "Autoplay was prevented. User interaction might be required.",
          err
        );
      });
    }
  }, []);

  const handleVideoEnd = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Skip Button (Safety valve) */}
      <button
        onClick={onComplete}
        className="absolute top-8 right-8 z-50 text-white/30 hover:text-white text-xs uppercase tracking-widest font-bold border border-white/10 hover:border-white/50 px-4 py-2 rounded-full transition-all"
      >
        Saltar Intro ↠
      </button>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-lavender-500/5 mix-blend-overlay z-20 pointer-events-none" />

      <video
        ref={videoRef}
        className="w-full h-full object-contain pointer-events-none"
        onEnded={handleVideoEnd}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          console.warn("Video source failed. Skipping intro.", e);
          onComplete();
        }}
      >
        <source src="/assets/videos/intro_oficial_v2.mp4?v=20260428" type="video/mp4" />
        su navegador no soporta video.
      </video>
    </div>
  );
};
