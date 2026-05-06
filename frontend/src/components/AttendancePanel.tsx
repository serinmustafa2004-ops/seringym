import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import type { AttendanceOverview } from "../lib/types";
import { IconBadge } from "./IconBadge";

function maxValue(items: Array<{ total: string }>) {
  return Math.max(...items.map((item) => Number(item.total)), 1);
}

export function AttendancePanel() {
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [member, setMember] = useState("");
  const [data, setData] = useState<AttendanceOverview | null>(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  async function load() {
    try {
      setError("");

      if (from && to && from > to) {
        setError("Başlangıç tarihi, bitiş tarihinden sonra olamaz.");
        setData(null);
        return;
      }

      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (member) params.set("member", member);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const result = await apiRequest<AttendanceOverview>(`/attendance${suffix}`);
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Kayıtlar yüklenemedi.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function clearFilters() {
    setDate("");
    setFrom("");
    setTo("");
    setMember("");
    setError("");
    void apiRequest<AttendanceOverview>("/attendance")
      .then((result) => setData(result))
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Kayıtlar yüklenemedi.")
      );
  }

  const hourlyMax = maxValue(data?.hourChart ?? []);
  const dailyMax = maxValue(data?.dayChart ?? []);

  return (
    <section className="panel-stack">
      <div className="form-card">
        <div className="panel-heading">
          <div>
            <div className="card-title-row">
              <IconBadge symbol="◉" tone="teal" />
              <h3>Salon Giriş Çıkış Takibi</h3>
            </div>
          </div>
        </div>
        <div className="program-form-grid">
          <label>
            Gün
            <input
              type="date"
              value={date}
              onChange={(event) => {
                const nextDate = event.target.value;
                setDate(nextDate);
                if (nextDate) {
                  setFrom("");
                  setTo("");
                }
              }}
            />
          </label>
          <label>
            Başlangıç Tarihi
            <input
              type="date"
              value={from}
              onChange={(event) => {
                const nextFrom = event.target.value;
                setFrom(nextFrom);
                if (nextFrom) {
                  setDate("");
                }
              }}
            />
          </label>
          <label>
            Bitiş Tarihi
            <input
              type="date"
              value={to}
              onChange={(event) => {
                const nextTo = event.target.value;
                setTo(nextTo);
                if (nextTo) {
                  setDate("");
                }
              }}
            />
          </label>
          <label>
            Üye Ara
            <input
              value={member}
              onChange={(event) => setMember(event.target.value)}
              placeholder="Örn: Ayşe veya uye001"
            />
          </label>
        </div>
        <div className="action-row">
          <button onClick={() => void load()}>
            Filtreleri Uygula
          </button>
          <button className="ghost-button" onClick={clearFilters}>
            Filtreleri Temizle
          </button>
          <button className="ghost-button" onClick={() => setShowDetails((current) => !current)}>
            {showDetails ? "Detayları Gizle" : "Detayları Göster"}
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </div>

      {data && showDetails ? (
        <>
          <div className="chart-grid">
            <div className="chart-card">
              <div className="card-title-row">
                <IconBadge symbol="▲" tone="gold" />
                <h3>Saatlik Giriş Yoğunluğu</h3>
              </div>
              <div className="bar-chart">
                {data.hourChart.map((item) => (
                  <div key={item.hour_label} className="bar-item">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${(Number(item.total) / hourlyMax) * 100}%` }}
                      />
                    </div>
                    <span>{item.hour_label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-title-row">
                <IconBadge symbol="◆" tone="coral" />
                <h3>Günlük Toplam Giriş</h3>
              </div>
              <div className="line-list">
                {data.dayChart.map((item) => (
                  <div key={item.day_label} className="line-item">
                    <span>{item.day_label}</span>
                    <div className="line-track">
                      <div
                        className="line-fill"
                        style={{ width: `${(Number(item.total) / dailyMax) * 100}%` }}
                      />
                    </div>
                    <strong>{item.total}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="card-title-row">
              <IconBadge symbol="◈" tone="slate" />
              <h3>Detaylı Kayıtlar</h3>
            </div>
            {data.records.length === 0 ? (
              <p className="helper-text">
                Bu filtrelerle eşleşen giriş çıkış kaydı bulunamadı. Filtreleri temizleyip tekrar dene.
              </p>
            ) : null}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Üye</th>
                    <th>Giriş Saati</th>
                    <th>Çıkış Saati</th>
                    <th>Yöntem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.full_name}</td>
                      <td>{new Date(record.check_in_at).toLocaleString("tr-TR")}</td>
                      <td>
                        {record.check_out_at
                          ? new Date(record.check_out_at).toLocaleString("tr-TR")
                          : "Çıkış kaydı yok"}
                      </td>
                      <td>{record.access_method === "qr" ? "Kare Kod" : "Kart"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {data && !showDetails ? (
        <div className="table-card compact-info-card">
          <div className="card-title-row">
            <IconBadge symbol="○" tone="slate" />
            <h3>Detaylar Gizli</h3>
          </div>
          <p>Grafikleri ve günlük giriş kayıtlarını görmek için "Detayları Göster" butonuna tıkla.</p>
        </div>
      ) : null}
    </section>
  );
}
