import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { FlameIcon } from "../components/icons/FlameIcon";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--auth">
      <div className="page--auth__brand">
        <FlameIcon width={28} height={34} color="var(--color-accent)" />
        <h2>Свечка</h2>
        <p className="hint">С возвращением — время подвести день</p>
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
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Вход..." : "Войти"}
        </button>
      </form>
      <p className="page--auth__footer muted">
        Нет аккаунта? <Link to="/register" className="link-accent">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
