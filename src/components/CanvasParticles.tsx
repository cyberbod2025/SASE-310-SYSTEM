import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const CanvasParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 40; // Fewer but more impactful
    const speedScale = 0.2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() + 0.5) * speedScale, // Movement mostly to the right
          vy: (Math.random() - 0.5) * (speedScale * 0.2),
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = () => {
      // Semi-transparent clear for subtle trails
      ctx.fillStyle = "rgba(2, 5, 16, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Starlink data flow style: mostly horizontal
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x > canvas.width) {
          p.x = 0;
          p.y = Math.random() * canvas.height;
        }
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(100, 180, 255, 0.5)";
        ctx.fillStyle = `rgba(100, 180, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for lines

        // Connect to one closest neighbor for "network" feel
        let minDist = 200;
        let nearest: Particle | null = null;
        for (let j = 0; j < particles.length; j++) {
          if (i === j) continue;
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearest = p2;
          }
        }

        if (nearest) {
          ctx.strokeStyle = `rgba(50, 130, 255, ${(1 - minDist / 200) * 0.2})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nearest.x, nearest.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-60"
      style={{ pointerEvents: "none" }}
    />
  );
};
