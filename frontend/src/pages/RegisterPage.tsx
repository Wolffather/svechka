import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register(email, password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зарегистрироваться.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--auth">
      <div className="page--auth__brand" style={{ alignItems: "flex-start", textAlign: "left" }}>
        <h2>Создать дневник</h2>
        <p className="hint">Пара минут — и вечер будет с кем разделить</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="you@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль (минимум 8 символов)</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Регистрация..." : "Создать аккаунт"}
        </button>
      </form>
      <p className="page--auth__footer muted">
        Уже есть аккаунт? <Link to="/login" className="link-accent">Войти</Link>
      </p>
    </div>
  );
}
