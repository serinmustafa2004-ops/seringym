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
            <p>{user.fullName} hesabı için şifre değişikliği ve temel güvenlik bilgileri burada yer alır.</p>
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

      <div className="table-card">
        <h3>Güvenlik Notları</h3>
        <div className="plain-info-list">
          <span>Şifreler veritabanında düz metin yerine güvenli karma yöntemiyle saklanır.</span>
          <span>Her istek oturum belirteci ile korunur ve yetki dışı erişimler engellenir.</span>
          <span>Yönetici hesapları için güçlü, benzersiz ve uzun şifre kullanılması önerilir.</span>
          <span>Sunum veya teslim sırasında `.env` dosyaları ve gizli anahtarlar paylaşılmamalıdır.</span>
        </div>
      </div>
    </section>
  );
}
