import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import type {
  EntryPassData,
  EntryPassScanResult,
  RecentEntryScanOverview,
  User
} from "../lib/types";

type Props = {
  user: User;
};

export function EntryPassPanel({ user }: Props) {
  const [passData, setPassData] = useState<EntryPassData | null>(null);
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState<EntryPassScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentEntryScanOverview | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState("");
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadPass() {
    try {
      setError("");
      setLoading(true);
      const result = await apiRequest<EntryPassData>("/entry-pass/me");
      setQrLoadFailed(false);
      setPassData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Giriş kare kodu yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user.role === "member") {
      void loadPass();
    }
    if (user.role === "admin") {
      void loadRecentScans();
    }
  }, [user.role]);

  async function loadRecentScans() {
    try {
      const result = await apiRequest<RecentEntryScanOverview>("/entry-pass/recent");
      setRecentScans(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Son giriş hareketleri yüklenemedi.");
    }
  }

  async function submitScan() {
    try {
      setError("");
      setScanResult(null);
      const result = await apiRequest<EntryPassScanResult>("/entry-pass/scan", {
        method: "POST",
        body: JSON.stringify({ passToken: scanCode })
      });
      setScanResult(result);
      setScanCode("");
      await loadRecentScans();
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Kare kod okutulamadı.");
    }
  }

  if (user.role === "member") {
    return (
      <section className="panel-stack">
        <div className="form-card entry-pass-card">
          <div className="panel-heading">
            <div>
              <h3>Salon Giriş Kodu</h3>
              <p>Bu kare kodu girişte görevliye göster. Okutulduğunda girişin ya da çıkışın otomatik kaydedilir.</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => void loadPass()}>
              Kodu Yenile
            </button>
          </div>

          {loading && !passData ? <p className="helper-text">Kare kod hazırlanıyor...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          {passData ? (
            <div className="entry-pass-display">
              {!qrLoadFailed ? (
                <img
                  src={passData.qrUrl}
                  alt="Salon giriş kare kodu"
                  onError={() => setQrLoadFailed(true)}
                />
              ) : (
                <div className="qr-fallback-box">
                  Kare kod görseli yüklenemedi. Aşağıdaki geçiş kodu ile görevli işlem yapabilir.
                </div>
              )}
              <div className="entry-pass-meta">
                <strong>{passData.fullName}</strong>
                <span>Kullanıcı adı: {passData.username ?? "-"}</span>
                <span className="entry-status-pill">{passData.currentStatus}</span>
                <small>
                  Son hareket:
                  {" "}
                  {passData.lastActionAt
                    ? new Date(passData.lastActionAt).toLocaleString("tr-TR")
                    : "Henüz kayıt yok"}
                </small>
                <div className="redeem-code-box entry-token-box">{passData.passToken}</div>
                <small>Bu kod {passData.expiresInHours} saat boyunca geçerlidir.</small>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="panel-stack">
      <div className="form-card compact-entry-card">
        <div className="panel-heading">
          <div>
            <h3>Kare Kod Okutma</h3>
            <p>Üyenin giriş kodunu okutunca sistem giriş ya da çıkış işlemini otomatik kaydeder.</p>
          </div>
          <button type="button" className="ghost-button" onClick={() => setShowScanner((current) => !current)}>
            {showScanner ? "Okutma Alanını Gizle" : "Okutma Alanını Aç"}
          </button>
        </div>

        <div className="compact-entry-summary">
          <span>Son okutulan hareketler</span>
          <strong>{recentScans?.records.length ?? 0} kayıt</strong>
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        {scanResult ? (
          <div
            className={
              scanResult.action === "check_in"
                ? "scan-result-card scan-result-card--success"
                : "scan-result-card scan-result-card--info"
            }
          >
            <strong>{scanResult.fullName}</strong>
            <p>{scanResult.message}</p>
          </div>
        ) : null}

        {showScanner ? (
          <>
            <label>
              Üye Kare Kodu
              <textarea
                value={scanCode}
                onChange={(event) => setScanCode(event.target.value)}
                rows={4}
                placeholder="Üyenin giriş kodunu buraya yapıştır..."
              />
            </label>

            <div className="action-row">
              <button type="button" disabled={scanCode.trim().length < 20} onClick={submitScan}>
                Kodu İşle
              </button>
            </div>
          </>
        ) : (
          <div className="table-card compact-info-card">
            <h3>Detaylar Gizli</h3>
            <p>Okutma alanını görmek için "Okutma Alanını Aç" butonuna tıkla.</p>
          </div>
        )}

        <div className="recent-scan-list">
          <h4>Son Giriş Hareketleri</h4>
          {recentScans?.records.length ? (
            recentScans.records.slice(0, showScanner ? 10 : 4).map((record) => (
              <div key={record.id} className="recent-scan-item">
                <div>
                  <strong>{record.fullName}</strong>
                  <span>{record.accessMethod}</span>
                </div>
                <div>
                  <strong>{record.status}</strong>
                  <span>{new Date(record.checkInAt).toLocaleString("tr-TR")}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="helper-text">Henüz görünür bir giriş hareketi yok.</p>
          )}
        </div>
      </div>
    </section>
  );
}
