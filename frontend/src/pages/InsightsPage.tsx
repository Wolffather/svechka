import { useEffect, useState } from "react";
import { insightsApi } from "../api/insights";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import type { WeeklyInsight } from "../types";

function formatWeekRange(iso: string): string {
  const start = new Date(`${iso}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startLabel = start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const endLabel = end.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return `Неделя ${startLabel} — ${endLabel}`;
}

// Backend returns one observation per line (see weekly-insight-system-prompt.txt) — split so
// each becomes its own card, matching the design.
function splitObservations(insightText: string): string[] {
  return insightText.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function InsightsPage() {
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    insightsApi
      .list(0, 20)
      .then((response) => setInsights(response.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Не удалось загрузить итоги недели."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page page--insights">
      <h3>Итоги недели</h3>
      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && <p className="hint">Загружаем наблюдения...</p>}
      {!loading && !error && insights.length === 0 && (
        <p className="hint">
          Пока недостаточно записей — первая ретроспектива появится после первой полной недели дневника.
        </p>
      )}

      {insights.map((insight) => (
        <section className="insight-week" key={insight.id}>
          <span className="tag tag-accent-2">{formatWeekRange(insight.weekStartDate)}</span>
          <div className="insight-cards">
            {splitObservations(insight.insightText).map((observation, i) => (
              <div className="card" key={i}>
                {observation}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
