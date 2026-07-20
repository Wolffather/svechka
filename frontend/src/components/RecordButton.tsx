import { FlameIcon } from "./icons/FlameIcon";

export function RecordButton({
  recording,
  disabled,
  onClick,
  ariaLabel,
}: {
  recording: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="record-wrap">
      <span className="record-ring" />
      <span className="record-ring record-ring--delayed" />
      <button
        type="button"
        className="record-button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={recording}
      >
        {recording ? (
          <FlameIcon width={34} height={41} color="var(--color-bg)" />
        ) : (
          <FlameIcon width={28} height={34} color="var(--color-bg)" />
        )}
      </button>
    </div>
  );
}
