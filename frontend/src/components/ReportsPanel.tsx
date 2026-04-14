import { API_URL, getAuthHeaders } from "../lib/api";

export function ReportsPanel() {
  async function exportFile(format: "excel" | "pdf") {
    const response = await fetch(`${API_URL}/admin/reports/export?format=${format}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.message ?? "Rapor alınamadı.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (format === "pdf") {
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => win.print();
      }
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = "seringym-yonetim-raporu.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel-stack">
      <div className="form-card">
        <div className="panel-heading">
          <div>
            <h3>Rapor Dışa Aktarma</h3>
            <p>Ödeme hareketlerini Excel uyumlu dosya veya yazdırılabilir PDF görünümü olarak dışa aktar.</p>
          </div>
        </div>
        <div className="action-row">
          <button type="button" onClick={() => void exportFile("excel")}>Excel İçin Dışa Aktar</button>
          <button type="button" className="ghost-button" onClick={() => void exportFile("pdf")}>PDF Görünümünü Aç</button>
        </div>
      </div>

      <div className="table-card">
        <h3>Yedekleme ve Veri Güvenliği</h3>
        <div className="plain-info-list">
          <span>Veritabanı `pg_dump` ile dışarı alınabilir ve ihtiyaç halinde aynı yapıya geri yüklenebilir.</span>
          <span>Yönetici raporları sadece yetkili hesaplarla görüntülenir ve dışa aktarılır.</span>
          <span>Şifreler düz metin olarak değil, karma biçiminde veritabanında tutulur.</span>
          <span>`.env`, veritabanı parolası ve gizli anahtarlar proje tesliminde ayrı tutulmalıdır.</span>
        </div>
      </div>
    </section>
  );
}
