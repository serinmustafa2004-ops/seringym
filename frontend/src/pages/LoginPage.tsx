import { FormEvent, useState } from "react";
import { apiRequest } from "../lib/api";
import type { User } from "../lib/types";

type Props = {
  onLogin: (payload: { token: string; user: User }) => void;
};

export function LoginPage({ onLogin }: Props) {
  const [role, setRole] = useState<User["role"]>("member");
  const [identifier, setIdentifier] = useState("uye001");
  const [password, setPassword] = useState("SerinUye001!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const presets: Record<User["role"], { title: string; identifier: string; password: string; badge: string }> = {
    member: {
      title: "Üye Girişi",
      identifier: "uye001",
      password: "SerinUye001!",
      badge: "Üye Alanı"
    },
    trainer: {
      title: "Antrenör Girişi",
      identifier: "mert.yildiz",
      password: "SerinAnt01!",
      badge: "Antrenör Alanı"
    },
    admin: {
      title: "Yönetici Girişi",
      identifier: "admin.serin",
      password: "SerinAdm01!",
      badge: "Yönetim Merkezi"
    }
  };

  function changeRole(nextRole: User["role"]) {
    setRole(nextRole);
    setIdentifier(presets[nextRole].identifier);
    setPassword(presets[nextRole].password);
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password, role })
      });

      localStorage.setItem("gympro_token", payload.token);
      onLogin(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setResetMessage("");
      const payload = await apiRequest<{ message: string; tempPassword: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ identifier, phoneLast4, role })
      });
      setPassword(payload.tempPassword);
      setResetMessage(`${payload.message} Geçici şifre: ${payload.tempPassword}`);
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : "Şifre sıfırlanamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel login-panel--hero">
        <span className="eyebrow">SerinSoft Sunar</span>
        <h1>SERİNGYM</h1>
        <div className="photo-strip">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80"
            alt="SerinGym ağırlık alanı"
          />
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80"
            alt="SerinGym koşu ve kondisyon alanı"
          />
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80"
            alt="SerinGym grup ders alanı"
          />
        </div>
      </section>

      <section className="login-panel login-panel--form">
        <div className="role-switcher">
          <button
            type="button"
            className={role === "member" ? "role-button role-button--active" : "role-button"}
            onClick={() => changeRole("member")}
          >
            Üye
          </button>
          <button
            type="button"
            className={role === "trainer" ? "role-button role-button--active" : "role-button"}
            onClick={() => changeRole("trainer")}
          >
            Antrenör
          </button>
          <button
            type="button"
            className={role === "admin" ? "role-button role-button--active" : "role-button"}
            onClick={() => changeRole("admin")}
          >
            Yönetici
          </button>
        </div>

        <div className="portal-badge">{presets[role].badge}</div>
        <h2>{presets[role].title}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Kullanıcı Adı veya E-posta
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} type="text" />
          </label>

          <label>
            Şifre
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Güvenli Giriş"}
          </button>
        </form>

        <div className="reset-box">
          <button type="button" className="ghost-button" onClick={() => setResetOpen((current) => !current)}>
            {resetOpen ? "Şifre Sıfırlamayı Gizle" : "Şifre Sıfırla"}
          </button>

          {resetOpen ? (
            <form onSubmit={handleResetPassword} className="reset-form">
              <label>
                Telefon Son 4 Hane
                <input
                  value={phoneLast4}
                  onChange={(event) => setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </label>
              <button type="submit" disabled={phoneLast4.length !== 4 || loading}>
                {loading ? "Oluşturuluyor..." : "Geçici Şifre Oluştur"}
              </button>
              {resetMessage ? <p className="helper-text">{resetMessage}</p> : null}
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}
