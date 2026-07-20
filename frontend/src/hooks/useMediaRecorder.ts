import { useCallback, useRef, useState } from "react";

export type RecordingState =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "stopped"
  | "permission-denied"
  | "no-device"
  | "unsupported";

// "Разумный потолок для вечерней записи" (TZ AI-модуля, п.1) — auto-stops a recording that
// runs long instead of letting it grow unbounded.
const MAX_DURATION_SECONDS = 10 * 60;

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4";
  }
  return "";
}

/**
 * Wraps getUserMedia + MediaRecorder. The recorded Blob is kept in state until the caller
 * explicitly calls reset() — that's what lets the record screen retry a failed upload
 * without asking the user to record again.
 */
export function useMediaRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState("stopped");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("requesting-permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setElapsedSeconds(0);

      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setElapsedSeconds(seconds);
        if (seconds >= MAX_DURATION_SECONDS) {
          stop();
        }
      }, 1000);

      setState("recording");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setState(name === "NotFoundError" || name === "OverconstrainedError" ? "no-device" : "permission-denied");
    }
  }, [stop]);

  const reset = useCallback(() => {
    setBlob(null);
    setElapsedSeconds(0);
    setState("idle");
  }, []);

  return { state, elapsedSeconds, blob, start, stop, reset };
}
