export function SolMayo({ size = 24, className = '' }: { size?: number; className?: string }) {
  const angles = [0,30,60,90,120,150,180,210,240,270,300,330,15,45,75,105,135,165,195,225,255,285,315,345];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`flex-shrink-0 ${className}`}>
      {angles.map((angle, i) => {
        const r = angle * Math.PI / 180;
        const isMain = i < 12;
        const len = isMain ? 26 : 18;
        const start = isMain ? 22 : 23;
        return (
          <line
            key={i}
            x1={50 + Math.cos(r) * start}
            y1={50 + Math.sin(r) * start}
            x2={50 + Math.cos(r) * (start + len)}
            y2={50 + Math.sin(r) * (start + len)}
            stroke="#F6B40E"
            strokeWidth={isMain ? 3.5 : 2}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="50" cy="50" r="18" fill="#F6B40E" stroke="#D4960A" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="10" fill="#D4960A" />
      <circle cx="45" cy="47" r="2" fill="#8B5E3C" />
      <circle cx="55" cy="47" r="2" fill="#8B5E3C" />
      <path d="M 44 54 Q 50 59 56 54" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
