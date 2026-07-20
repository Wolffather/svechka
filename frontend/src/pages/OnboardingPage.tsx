import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FlameIcon } from "../components/icons/FlameIcon";
import { MicIcon } from "../components/icons/MicIcon";

const TOTAL_STEPS = 2;

export function OnboardingPage() {
  const { hasConsented, acceptConsent } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();

  if (hasConsented) {
    return <Navigate to="/" replace />;
  }

  function handleFinish() {
    acceptConsent();
    navigate("/", { replace: true });
  }

  return (
    <div className="page page--onboarding">
      {step === 1 ? (
        <>
          <FlameIcon width={30} height={36} color="var(--color-accent)" />
          <h2>Каждый вечер — как у костра в лагере</h2>
          <p className="hint">
            По кругу рассказываешь, как прошёл день, и тебя слушают без осуждения. Свечка — то же
            самое, только для тебя одного.
          </p>
        </>
      ) : (
        <>
          <MicIcon size={28} color="var(--color-accent)" />
          <h2>Голос уходит только на расшифровку в текст</h2>
          <p className="hint">
            Никто не слушает записи — только ты видишь то, что рассказал. Текст помогает языковой
            модели сформировать резюме дня и, если нужно, задать один уточняющий вопрос.
          </p>
          <p className="hint onboarding-disclaimer">
            Свечка — это не замена психологической помощи. Если тебе тяжело, поговори с близким
            человеком или со специалистом.
          </p>
        </>
      )}

      <div className="flex-spacer" />

      <div className="onboarding-dots">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i} className={i + 1 === step ? "onboarding-dot onboarding-dot--active" : "onboarding-dot"} />
        ))}
      </div>

      {step === 1 ? (
        <button type="button" className="btn btn-primary btn-block" onClick={() => setStep(2)}>
          Дальше
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={handleFinish}>
          Начать
        </button>
      )}
    </div>
  );
}
