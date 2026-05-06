import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { User } from "../lib/types";

type Props = {
  user: User;
};

export function SecurityPanel({ user }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    try {
      setSaving(true);
      setMessage("");
      const result = await apiRequest<{ message: string }>("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Şifre güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel-stack">
      <div className="form-card">
        <div className="panel-heading">
          <div>
            <h3>Şifre ve Güvenlik</h3>
          </div>
        </div>
        <div className="program-form-grid">
          <label>
            Mevcut Şifre
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label>
            Yeni Şifre
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
        </div>
        <div className="action-row">
          <button type="button" disabled={!currentPassword || newPassword.length < 8 || saving} onClick={submit}>
            {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
      </div>
    </section>
  );
}
