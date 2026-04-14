import { IconBadge } from "./IconBadge";

type Props = {
  occupancyRate: number;
  activePeople: number;
  femaleCount: number;
  maleCount: number;
};

export function SalonStatusCard({
  occupancyRate,
  activePeople,
  femaleCount,
  maleCount
}: Props) {
  const total = Math.max(femaleCount + maleCount, 1);
  const femaleRate = (femaleCount / total) * 100;
  const maleRate = (maleCount / total) * 100;

  return (
    <div className="dashboard-card salon-status-card">
      <div className="card-title-row">
        <IconBadge symbol="●" tone="teal" size="sm" />
        <h2 className="section-title">Salon Durumu</h2>
      </div>

      <div className="salon-graphics">
        <div className="occupancy-ring" style={{ ["--occupancy" as string]: `${occupancyRate}%` }}>
          <div>
            <strong>%{occupancyRate}</strong>
            <span>Doluluk</span>
          </div>
        </div>

        <div className="gender-split-card">
          <div className="card-title-row">
            <IconBadge symbol="◇" tone="coral" size="sm" />
            <span>Cinsiyet Dağılımı</span>
          </div>
          <div className="gender-split-bar">
            <span className="gender-split-bar__female" style={{ width: `${femaleRate}%` }} />
            <span className="gender-split-bar__male" style={{ width: `${maleRate}%` }} />
          </div>
          <div className="gender-legend">
            <span>Kadın: {femaleCount}</span>
            <span>Erkek: {maleCount}</span>
          </div>
        </div>
      </div>

      <div className="salon-status-stats">
        <div className="salon-status-item">
          <strong>{activePeople}</strong>
          <span>Aktif kişi</span>
        </div>
        <div className="salon-status-item">
          <strong>{femaleCount + maleCount}</strong>
          <span>Anlık kişi toplamı</span>
        </div>
      </div>
    </div>
  );
}
