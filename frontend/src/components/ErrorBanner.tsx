export function ErrorBanner({
  message,
  onRetry,
  retryLabel = "Повторить",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="error-banner__retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
