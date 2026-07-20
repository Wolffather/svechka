export function MicIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" stroke={color} strokeWidth="2" />
      <path d="M6 11a6 6 0 0012 0M12 19v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
