import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { RecordButton } from "../components/RecordButton";
import { Timer } from "../components/Timer";
import { ErrorBanner } from "../components/ErrorBanner";
import { GearIcon } from "../components/icons/GearIcon";
import { entriesApi } from "../api/entries";
import { ApiError } from "../api/client";

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function todayLabel(): string {
  const formatted = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function RecordPage() {
  const { state, elapsedSeconds, blob, start, stop, reset } = useMediaRecorder();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 422 from the backend means the audio itself was unreadable — retrying the same blob
  // would just fail the same way, so we offer to re-record instead of a blind retry.
  const [unreadable, setUnreadable] = useState(false);
  const navigate = useNavigate();

  async function upload(audioBlob: Blob) {
    setUploading(true);
    setError(null);
    setUnreadable(false);
    try {
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const response = await entriesApi.create(todayIso(), audioBlob, `entry.${extension}`);
      reset();
      if (response.followUpQuestion) {
        navigate(`/follow-up/${response.entryId}`, { state: { question: response.followUpQuestion } });
      } else {
        navigate(`/summary/${response.entryId}`, {
          state: { summary: response.summary, status: response.status },
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setUnreadable(err.status === 422);
      } else {
        setError("Не удалось отправить запись.");
      }
    } finally {
      setUploading(false);
    }
  }

  function recordAgain() {
    setError(null);
    setUnreadable(false);
    reset();
    void start();
  }

  useEffect(() => {
    if (state === "stopped" && blob && !uploading && !error) {
      void upload(blob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, blob]);

  const recording = state === "recording";
  const busy = state === "requesting-permission" || uploading;

  let hint = "Нажми, когда будешь готов рассказать, как прошёл день";
  if (state === "requesting-permission") hint = "Запрашиваем доступ к микрофону...";
  else if (recording) hint = "Говори свободно — можно молчать сколько нужно";
  else if (uploading) hint = "Отправляем запись...";
  else if (state === "stopped") hint = "Запись готова";

  return (
    <div className="page page--record">
      <Link to="/settings" className="corner-icon-button" aria-label="Настройки">
        <GearIcon />
      </Link>

      <div className="record-header">
        <div className="eyebrow" style={{ textAlign: "center" }}>{todayLabel()}</div>
        <h2>Как прошёл день?</h2>
      </div>

      <div className="record-center">
        <RecordButton
          recording={recording}
          disabled={busy && !recording}
          onClick={recording ? stop : start}
          ariaLabel={recording ? "Закончить запись" : "Начать день"}
        />

        <div className="record-status">
          {recording ? (
            <Timer seconds={elapsedSeconds} />
          ) : (
            <span className="timer">{state === "stopped" ? "Готово" : "Начать"}</span>
          )}
          <p className="hint">{hint}</p>
        </div>
      </div>

      {state === "permission-denied" && (
        <ErrorBanner
          message="Доступ к микрофону заблокирован. Если после нажатия «Повторить» браузер не спросит
            разрешение заново — откройте настройки сайта (значок замка или микрофона рядом с адресом
            страницы), разрешите доступ к микрофону там вручную, затем нажмите «Повторить» ещё раз."
          onRetry={start}
        />
      )}

      {state === "no-device" && (
        <ErrorBanner message="Не удалось найти микрофон. Проверьте, что он подключён, и попробуйте снова." onRetry={start} />
      )}

      {state === "unsupported" && (
        <ErrorBanner message="Запись голоса недоступна в этом браузере или соединении. Откройте сайт по HTTPS (или через localhost) в актуальной версии Chrome, Firefox или Safari." />
      )}

      {state === "stopped" && error && blob && (
        <ErrorBanner
          message={error}
          onRetry={unreadable ? recordAgain : () => upload(blob)}
          retryLabel={unreadable ? "Перезаписать" : "Повторить"}
        />
      )}
    </div>
  );
}
