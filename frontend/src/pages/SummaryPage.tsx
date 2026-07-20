import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { entriesApi } from "../api/entries";
import { FlameIcon } from "../components/icons/FlameIcon";
import type { EntryStatus } from "../types";

function todayLabel(): string {
  const formatted = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Splits on the punctuation that naturally ends a clause, so each fragment can fade in on
// its own — matching the design's "text settles in phrase by phrase" ending ritual.
function splitIntoPhrases(text: string): string[] {
  return text.split(/(?<=[,—.!?])\s+/).filter((phrase) => phrase.trim().length > 0);
}

export function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state?: { summary?: string; status?: EntryStatus } };
  const [summary, setSummary] = useState<string | null>(location.state?.summary ?? null);
  const [status, setStatus] = useState<EntryStatus | null>(location.state?.status ?? null);

  useEffect(() => {
    if (!summary && id) {
      entriesApi
        .get(id)
        .then((entry) => {
          setSummary(entry.aiSummary);
          setStatus(entry.status);
        })
        .catch(() => setSummary(null));
    }
  }, [id, summary]);

  const isCrisis = status === "CRISIS_SUPPORT";

  if (isCrisis) {
    return (
      <div className="page page--summary">
        <FlameIcon width={28} height={34} color="var(--color-accent)" />
        {summary ? <p className="summary-text">{summary}</p> : <p className="hint">Загружаем...</p>}
        <Link to="/" className="link-accent">
          На главный экран
        </Link>
      </div>
    );
  }

  const phrases = summary ? splitIntoPhrases(summary) : [];

  return (
    <div className="page page--summary">
      <div className="eyebrow">{todayLabel()}</div>
      {phrases.length > 0 ? (
        <p className="summary-text">
          {phrases.map((phrase, i) => (
            <span key={i} className="summary-phrase" style={{ animationDelay: `${i * 0.7}s` }}>
              {phrase}{" "}
            </span>
          ))}
        </p>
      ) : (
        <p className="hint">Загружаем резюме...</p>
      )}
      <div className="flex-spacer" />
      <Link to="/" className="link-accent">
        Готово
      </Link>
    </div>
  );
}
