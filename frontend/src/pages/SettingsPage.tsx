import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { SunIcon } from "../components/icons/SunIcon";
import { MoonIcon } from "../components/icons/MoonIcon";

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      await authApi.updateEmail(newEmail, emailPassword);
      await refreshUser();
      setEmailPassword("");
      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : "Не удалось изменить email.");
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("Новый пароль должен быть не короче 8 символов.");
      return;
    }
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await authApi.updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Не удалось изменить пароль.");
    } finally {
      setPasswordSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page page--settings">
      <Link to="/" className="link-accent">
        ← Назад
      </Link>
      <h2>Настройки</h2>

      <section className="settings-section">
        <h3 className="settings-section__title">Email</h3>
        <form onSubmit={handleEmailSubmit}>
          <div className="field">
            <label htmlFor="newEmail">Новый email</label>
            <input
              id="newEmail"
              className="input"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emailPassword">Текущий пароль</label>
            <input
              id="emailPassword"
              className="input"
              type="password"
              required
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
            />
          </div>
          {emailError && <ErrorBanner message={emailError} />}
          {emailSuccess && <p className="hint settings-success">Email обновлён.</p>}
          <button type="submit" className="btn btn-primary" disabled={emailSubmitting}>
            {emailSubmitting ? "Сохраняем..." : "Сохранить email"}
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Пароль</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="field">
            <label htmlFor="currentPassword">Текущий пароль</label>
            <input
              id="currentPassword"
              className="input"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Новый пароль (минимум 8 символов)</label>
            <input
              id="newPassword"
              className="input"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {passwordError && <ErrorBanner message={passwordError} />}
          {passwordSuccess && <p className="hint settings-success">Пароль обновлён.</p>}
          <button type="submit" className="btn btn-primary" disabled={passwordSubmitting}>
            {passwordSubmitting ? "Сохраняем..." : "Сохранить пароль"}
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Тема</h3>
        <div className="theme-select">
          <button
            type="button"
            className={theme === "light" ? "theme-option theme-option--active" : "theme-option"}
            onClick={() => setTheme("light")}
          >
            <SunIcon /> Светлая
          </button>
          <button
            type="button"
            className={theme === "dark" ? "theme-option theme-option--active" : "theme-option"}
            onClick={() => setTheme("dark")}
          >
            <MoonIcon /> Тёмная
          </button>
        </div>
      </section>

      <button type="button" className="btn btn-ghost" onClick={handleLogout}>
        Выйти из аккаунта
      </button>
    </div>
  );
}
