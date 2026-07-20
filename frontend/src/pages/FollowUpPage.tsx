import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { ErrorBanner } from "../components/ErrorBanner";
import { Timer } from "../components/Timer";
import { MicIcon } from "../components/icons/MicIcon";
import { StopIcon } from "../components/icons/StopIcon";
import { entriesApi } from "../api/entries";
import { ApiError } from "../api/client";

export function FollowUpPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state?: { question?: string } };
  const navigate = useNavigate();

  const [question, setQuestion] = useState<string | null>(location.state?.question ?? null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState(false);

  const { state: recState, elapsedSeconds, blob, start, stop, reset } = useMediaRecorder();

  useEffect(() => {
    if (!question && id) {
      entriesApi
        .get(id)
        .then((entry) => setQuestion(entry.aiFollowUpQuestion))
        .catch(() => setQuestion(null));
    }
  }, [id, question]);

  async function submit(text?: string, audio?: Blob) {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    setUnreadable(false);
    try {
      const extension = audio?.type.includes("mp4") ? "mp4" : "webm";
      const response = await entriesApi.submitFollowUp(id, text, audio, audio ? `answer.${extension}` : undefined);
      reset();
      navigate(`/summary/${id}`, { state: { summary: response.summary }, replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // 422 only means "unreadable" for a voice answer — retrying the same blob would
        // fail the same way, so offer to re-record instead of a blind retry.
        setUnreadable(err.status === 422 && Boolean(audio));
      } else {
        setError("Не удалось отправить ответ.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function recordAnswerAgain() {
    setError(null);
    setUnreadable(false);
    reset();
    void start();
  }

  useEffect(() => {
    if (recState === "stopped" && blob && !submitting && !error) {
      void submit(undefined, blob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recState, blob]);

  function handlePrimaryAction() {
    if (recState === "recording") {
      stop();
      return;
    }
    if (answerText.trim()) {
      void submit(answerText.trim());
      return;
    }
    void start();
  }

  const recording = recState === "recording";
  const busy = submitting || recState === "requesting-permission";

  return (
    <div className="page page--follow-up">
      <h3 className="quote">{question ? `«${question}»` : "Загружаем вопрос..."}</h3>

      <div style={{ flex: 1 }} />

      <textarea
        className="input"
        placeholder="Или напиши, если так проще"
        rows={4}
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        disabled={recording}
      />

      {recState === "permission-denied" && (
        <ErrorBanner message="Нет доступа к микрофону. Разрешите доступ и попробуйте снова." onRetry={start} />
      )}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={unreadable ? recordAnswerAgain : () => submit(answerText.trim() || undefined, blob ?? undefined)}
          retryLabel={unreadable ? "Перезаписать" : "Повторить"}
        />
      )}

      <div className="follow-up-actions">
        <button
          type="button"
          className="btn btn-icon"
          onClick={handlePrimaryAction}
          disabled={busy}
          aria-label={recording ? "Остановить запись ответа" : answerText.trim() ? "Отправить ответ" : "Ответить голосом"}
        >
          {recording ? <StopIcon /> : <MicIcon />}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => submit()} disabled={busy || recording}>
          Пропустить
        </button>
      </div>

      {recording && (
        <div style={{ textAlign: "center" }}>
          <Timer seconds={elapsedSeconds} />
        </div>
      )}
    </div>
  );
}
