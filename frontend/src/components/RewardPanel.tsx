import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { RewardRedeemResult, RewardsData } from "../lib/types";
import { cevirMetin } from "../lib/translate";
import { IconBadge } from "./IconBadge";

type Props = {
  data: RewardsData;
  onRefresh: () => Promise<void>;
};

function seviyeEtiketi(tier: string) {
  if (tier === "Gold") return "Altın";
  if (tier === "Silver") return "Gümüş";
  if (tier === "Starter") return "Başlangıç";
  return tier;
}

export function RewardPanel({ data, onRefresh }: Props) {
  const [redeemInfo, setRedeemInfo] = useState<RewardRedeemResult | null>(null);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);

  async function closeModal() {
    setRedeemInfo(null);
    try {
      await onRefresh();
    } catch {
      // Modal kapansa da sayfa kullanılabilir kalsın.
    }
  }

  async function redeem(rewardId: string) {
    try {
      const result = await apiRequest<RewardRedeemResult>("/rewards/redeem", {
        method: "POST",
        body: JSON.stringify({ rewardId })
      });
      setQrLoadFailed(false);
      setRedeemInfo(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ödül kullanılamadı.");
    }
  }

  return (
    <>
      <div className="reward-layout">
        <section className="reward-wallet">
          <div className="card-title-row">
            <IconBadge symbol="◇" tone="gold" size="sm" />
            <h3>Ödül Sistemi</h3>
          </div>
          <p>Aktif puan: {data.wallet.points_balance}</p>
          <p>Toplam kazanılan: {data.wallet.lifetime_points}</p>
          <p>Seviye: {seviyeEtiketi(data.wallet.tier_name)}</p>
        </section>

        <section className="reward-section reward-section--badges">
          <div className="card-title-row">
            <IconBadge symbol="●" tone="teal" size="sm" />
            <h3>Kazanılan Rozetler</h3>
          </div>
          <div className="badge-grid">
            {data.badges.map((badge) => (
              <article className="badge-card" key={badge.name}>
                <div className="card-title-row">
                  <IconBadge symbol="●" tone="teal" size="sm" />
                  <strong>{cevirMetin(badge.name)}</strong>
                </div>
                <p>{cevirMetin(badge.description)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reward-section reward-section--catalog">
          <div className="card-title-row">
            <IconBadge symbol="◇" tone="coral" size="sm" />
            <h3>Kullanılabilir Ödüller</h3>
          </div>
          <div className="reward-catalog">
            {data.rewards.map((reward) => (
              <article className="reward-card" key={reward.id}>
                <div>
                  <div className="card-title-row">
                    <IconBadge symbol="◇" tone="coral" size="sm" />
                    <strong>{cevirMetin(reward.name)}</strong>
                  </div>
                  <p>{cevirMetin(reward.description)}</p>
                </div>
                <div className="reward-actions">
                  <span>{reward.points_cost} puan</span>
                  <button
                    disabled={data.wallet.points_balance < reward.points_cost}
                    onClick={() => redeem(reward.id)}
                  >
                    Kare Kod ile Kullan
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {redeemInfo ? (
        <div className="qr-modal-backdrop" onClick={() => void closeModal()}>
          <div className="qr-modal" onClick={(event) => event.stopPropagation()}>
            <span className="eyebrow">Ödül Teslim Kodu</span>
            <h3>{cevirMetin(redeemInfo.rewardName)}</h3>
            {!qrLoadFailed ? (
              <img
                src={redeemInfo.qrUrl}
                alt="Ödül teslim kare kodu"
                onError={() => setQrLoadFailed(true)}
              />
            ) : (
              <div className="qr-fallback-box">
                Kare kod görseli yüklenemedi. Aşağıdaki teslim kodu ile ödül doğrulanabilir.
              </div>
            )}
            <p>Salon görevlisi bu kare kodu okutarak ödül teslimini doğrulayabilir.</p>
            <div className="redeem-code-box">{redeemInfo.redeemCode}</div>
            <button onClick={() => void closeModal()}>Kapat</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
