const FLAME_PATH =
  "M10 0C10 0 3 8.5 3 14.5C3 19.75 6.5 24 10 24C13.5 24 17 19.75 17 14.5C17 12 15.5 9.5 14 8C14 10 12.5 11.5 11 11.5C9 11.5 8.5 9 9.5 6.5C10.5 4 11 2 10 0Z";

export function FlameIcon({ width = 28, height = 34, color = "currentColor" }: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 24" fill="none" aria-hidden="true">
      <path d={FLAME_PATH} fill={color} />
    </svg>
  );
}
