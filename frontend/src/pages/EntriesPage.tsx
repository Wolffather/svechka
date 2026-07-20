import { useEffect, useState } from "react";
import { entriesApi } from "../api/entries";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import type { EntrySummary } from "../types";

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  const formatted = new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function EntriesPage() {
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load(pageToLoad: number) {
    setLoading(true);
    setError(null);
    entriesApi
      .list(pageToLoad, PAGE_SIZE)
      .then((response) => {
        setEntries(response.content);
        setTotalPages(response.totalPages);
        setPage(response.page);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Не удалось загрузить дневник."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page page--entries">
      <h3>Твои дни</h3>
      {error && <ErrorBanner message={error} onRetry={() => load(page)} />}
      {loading && <p className="hint">Загружаем записи...</p>}
      {!loading && !error && entries.length === 0 && <p className="hint">Пока нет ни одной записи.</p>}

      {entries.length > 0 && (
        <div className="thread">
          {entries.map((entry, index) => (
            <div className="thread-item" key={entry.id}>
              <span className={index === 0 && page === 0 ? "thread-dot thread-dot--active" : "thread-dot"} />
              <div className="thread-item__header">
                <span className="eyebrow">{formatDate(entry.date)}</span>
              </div>
              <p className="thread-item__body">
                {entry.summary ?? (entry.status === "AWAITING_FOLLOW_UP" ? "Ждёт уточняющего ответа" : "")}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="btn btn-ghost" disabled={page <= 0} onClick={() => load(page - 1)}>
            Назад
          </button>
          <span className="muted" style={{ fontSize: "13px" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}
