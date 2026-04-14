import { useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import type { ManagedUsersOverview } from "../lib/types";

type Props = {
  data: ManagedUsersOverview;
  onRefresh: () => Promise<void>;
};

type FormState = {
  fullName: string;
  username: string;
  email: string;
  role: "member" | "trainer" | "admin";
  phone: string;
  gender: string;
  password: string;
  membershipType: "daily" | "monthly" | "yearly";
  trainerTitle: string;
  trainerHourlyRate: string;
  trainerBio: string;
  specialties: string;
};

const emptyForm: FormState = {
  fullName: "",
  username: "",
  email: "",
  role: "member",
  phone: "",
  gender: "Belirtilmedi",
  password: "",
  membershipType: "monthly",
  trainerTitle: "",
  trainerHourlyRate: "",
  trainerBio: "",
  specialties: ""
};

export function AdminUsersPanel({ data, onRefresh }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);

  const visibleUsers = useMemo(
    () =>
      data.users.filter((user) =>
        `${user.full_name} ${user.username ?? ""} ${user.email}`
          .toLocaleLowerCase("tr-TR")
          .includes(filter.toLocaleLowerCase("tr-TR"))
      ),
    [data.users, filter]
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editUser(user: ManagedUsersOverview["users"][number]) {
    setEditingId(user.id);
    setForm({
      fullName: user.full_name,
      username: user.username ?? "",
      email: user.email,
      role: user.role,
      phone: user.phone ?? "",
      gender: user.gender ?? "Belirtilmedi",
      password: "",
      membershipType: (user.membership_type as "daily" | "monthly" | "yearly" | null) ?? "monthly",
      trainerTitle: user.trainer_title ?? "",
      trainerHourlyRate: user.hourly_rate ?? "",
      trainerBio: "",
      specialties: (user.specialties ?? []).join(", ")
    });
    setMessage("");
  }

  async function submit() {
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        role: form.role,
        phone: form.phone,
        gender: form.gender,
        password: form.password,
        membershipType: form.membershipType,
        trainerTitle: form.trainerTitle,
        trainerHourlyRate: Number(form.trainerHourlyRate || 0),
        trainerBio: form.trainerBio,
        specialties: form.specialties.split(",").map((item) => item.trim()).filter(Boolean)
      };

      const result = editingId
        ? await apiRequest<{ message: string }>(`/admin/users/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          })
        : await apiRequest<{ message: string }>("/admin/users", {
            method: "POST",
            body: JSON.stringify(payload)
          });

      setMessage(result.message);
      setEditingId(null);
      setForm(emptyForm);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(userId: string) {
    const confirmed = globalThis.confirm("Bu kullanıcıyı silmek istediğine emin misin?");
    if (!confirmed) return;
    try {
      await apiRequest<{ message: string }>(`/admin/users/${userId}`, { method: "DELETE" });
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kullanıcı silinemedi.");
    }
  }

  return (
    <section className="panel-stack">
      <div className="mini-stats-grid mini-stats-grid--four">
        <article className="mini-stat-card"><span>Toplam Kullanıcı</span><strong>{data.summary.total_users}</strong></article>
        <article className="mini-stat-card"><span>Üye</span><strong>{data.summary.total_members}</strong></article>
        <article className="mini-stat-card"><span>Antrenör</span><strong>{data.summary.total_trainers}</strong></article>
        <article className="mini-stat-card"><span>Yönetici</span><strong>{data.summary.total_admins}</strong></article>
      </div>

      <div className="form-card">
        <div className="panel-heading">
          <div>
            <h3>{editingId ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}</h3>
            <p>Gerçek kullanıcı ekleme, güncelleme ve silme işlemleri bu ekrandan yürütülür.</p>
          </div>
          {editingId ? <button type="button" className="ghost-button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>İptal</button> : null}
        </div>

        <div className="program-form-grid">
          <label>Ad Soyad<input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} /></label>
          <label>Kullanıcı Adı<input value={form.username} onChange={(event) => setField("username", event.target.value)} /></label>
          <label>E-posta<input value={form.email} onChange={(event) => setField("email", event.target.value)} /></label>
          <label>Telefon<input value={form.phone} onChange={(event) => setField("phone", event.target.value)} /></label>
          <label>
            Rol
            <select value={form.role} onChange={(event) => setField("role", event.target.value as FormState["role"])} disabled={Boolean(editingId)}>
              <option value="member">Üye</option>
              <option value="trainer">Antrenör</option>
              <option value="admin">Yönetici</option>
            </select>
          </label>
          <label>{editingId ? "Şifre" : "İlk Şifre"}<input type="password" value={form.password} onChange={(event) => setField("password", event.target.value)} placeholder={editingId ? "Düzenlemede kullanılmaz" : ""} disabled={Boolean(editingId)} /></label>

          {form.role === "member" ? (
            <label>
              Üyelik Tipi
              <select value={form.membershipType} onChange={(event) => setField("membershipType", event.target.value as FormState["membershipType"])}>
                <option value="daily">Günlük</option>
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
              </select>
            </label>
          ) : null}

          {form.role === "trainer" ? (
            <>
              <label>Antrenör Unvanı<input value={form.trainerTitle} onChange={(event) => setField("trainerTitle", event.target.value)} /></label>
              <label>Saatlik Ücret<input value={form.trainerHourlyRate} onChange={(event) => setField("trainerHourlyRate", event.target.value)} /></label>
              <label className="span-2">Uzmanlıklar<input value={form.specialties} onChange={(event) => setField("specialties", event.target.value)} placeholder="Pilates, Postür, Mobilite" /></label>
            </>
          ) : null}
        </div>

        <div className="action-row">
          <button
            type="button"
            disabled={!form.fullName || !form.username || !form.email || (!editingId && form.password.length < 8) || saving}
            onClick={submit}
          >
            {saving ? "Kaydediliyor..." : editingId ? "Değişiklikleri Kaydet" : "Kullanıcıyı Oluştur"}
          </button>
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
      </div>

      <div className="table-card">
        <div className="panel-heading">
          <h3>Kullanıcı Listesi</h3>
          <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Ad, kullanıcı adı veya e-posta ara" />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Rol</th>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Detay</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.role === "member" ? "Üye" : user.role === "trainer" ? "Antrenör" : "Yönetici"}</td>
                  <td>{user.username ?? "-"}</td>
                  <td>{user.email}</td>
                  <td>{user.role === "member" ? (user.membership_type ?? "-") : user.role === "trainer" ? (user.trainer_title ?? "-") : "-"}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="ghost-button" onClick={() => editUser(user)}>Düzenle</button>
                      <button type="button" className="danger-button" onClick={() => void removeUser(user.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
