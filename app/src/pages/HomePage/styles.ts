export const GLOBAL_STYLES = `
  :root {
    --primary: #10b981;
    --secondary: #a3e635;
    --dark: #0a0a0a;
    --darker: #050505;
    --neon: #00ff88;
  }

  .gui-root {
    font-family: 'Inter', sans-serif;
    background-color: var(--darker);
    color: #ffffff;
    overflow-x: hidden;
    cursor: auto;
  }
  .gui-root * { cursor: inherit; }
  .gui-root a, .gui-root button, .gui-root [role="button"] { cursor: pointer; }
  .gui-root input, .gui-root textarea, .gui-root select { cursor: text; }

  .gui-root h1, .gui-root h2, .gui-root h3, .gui-root .display-font {
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.02em;
  }

  .gui-root ::selection { background: var(--neon); color: black; }
  .gui-root ::-webkit-scrollbar { width: 8px; }
  .gui-root ::-webkit-scrollbar-track { background: var(--darker); }
  .gui-root ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, var(--primary), var(--secondary));
    border-radius: 4px;
  }

  .noise-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 9999; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .glass-panel {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .frame-offset { position: relative; z-index: 1; }
  .frame-offset::before {
    content: ''; position: absolute; top: 20px; left: -20px;
    right: 20px; bottom: -20px; border: 2px solid var(--primary);
    z-index: -1; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); opacity: 0.6;
  }
  .frame-offset:hover::before {
    top: 10px; left: -10px; right: 10px; bottom: -10px;
    opacity: 1; border-color: var(--neon);
  }

  .gradient-text {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--neon) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .grid-pattern {
    background-image:
      linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .diagonal-clip { clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%); }

  .bento-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
  .bento-card {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 1.5rem; padding: 2.5rem; position: relative;
    overflow: hidden; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  }
  .bento-card::before {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--neon), transparent);
    transition: left 0.6s;
  }
  .bento-card:hover::before { left: 100%; }
  .bento-card:hover {
    border-color: rgba(0,255,136,0.3); transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .bento-large { grid-row: span 2; }
  .bento-wide  { grid-column: span 2; }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-20px) rotate(1deg); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); }
    50%       { box-shadow: 0 0 40px rgba(0,255,136,0.6); }
  }
  .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

  .reveal-element {
    opacity: 0; transform: translateY(40px) scale(0.95);
    transition: all 0.8s cubic-bezier(0.4,0,0.2,1);
  }
  .reveal-element.active { opacity: 1; transform: translateY(0) scale(1); }

  .magnetic-btn { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }

  .glitch-text { position: relative; }
  .glitch-text::before, .glitch-text::after {
    content: attr(data-text); position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
  }
  .glitch-text::before {
    left: 2px; text-shadow: -1px 0 #ff00ff;
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim-2 3s infinite linear alternate-reverse;
  }
  .glitch-text::after {
    left: -2px; text-shadow: -1px 0 #00ff00;
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim 2.5s infinite linear alternate-reverse;
  }
  @keyframes glitch-anim {
    0%   { clip: rect(10px, 9999px, 85px,  0); }
    20%  { clip: rect(63px, 9999px, 130px, 0); }
    40%  { clip: rect(25px, 9999px, 15px,  0); }
    60%  { clip: rect(88px, 9999px, 95px,  0); }
    80%  { clip: rect(45px, 9999px, 60px,  0); }
    100% { clip: rect(15px, 9999px, 110px, 0); }
  }
  @keyframes glitch-anim-2 {
    0%   { clip: rect(65px, 9999px, 99px,  0); }
    20%  { clip: rect(10px, 9999px, 85px,  0); }
    40%  { clip: rect(88px, 9999px, 150px, 0); }
    60%  { clip: rect(25px, 9999px, 35px,  0); }
    80%  { clip: rect(45px, 9999px, 60px,  0); }
    100% { clip: rect(15px, 9999px, 80px,  0); }
  }

  .course-3d { transform-style: preserve-3d; transition: transform 0.4s ease; }
  .course-3d:hover { transform: perspective(1000px) rotateX(5deg) rotateY(-5deg) translateZ(20px); }

  .marquee-container { overflow: hidden; white-space: nowrap; }
  .marquee-content { display: inline-block; animation: marquee 20s linear infinite; }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .stroke-text { -webkit-text-stroke: 2px rgba(255,255,255,0.1); color: transparent; }
  .spotlight {
    background: radial-gradient(
      circle at var(--x, 50%) var(--y, 50%),
      rgba(16,185,129,0.15) 0%,
      transparent 50%
    );
  }

  @media (max-width: 768px) {
    .bento-container { grid-template-columns: 1fr; }
    .bento-large, .bento-wide { grid-row: span 1; grid-column: span 1; }
  }
`;
