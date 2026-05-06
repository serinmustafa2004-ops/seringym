import type { RecommendationOverview } from "../lib/types";
import { IconBadge } from "./IconBadge";

type Props = {
  data: RecommendationOverview;
};

export function RecommendationsPanel({ data }: Props) {
  const [featuredInsight, ...otherInsights] = data.insights;

  return (
    <section className="recommendations-layout">
      {featuredInsight ? (
        <article className="insight-card insight-card--featured">
          <div className="card-title-row">
            <IconBadge symbol="◇" tone="teal" size="sm" />
            <span className="eyebrow">Yapay Zekâ Destekli Öneri</span>
          </div>
          <h2>{featuredInsight.title}</h2>
          <p>{featuredInsight.description}</p>
          <div className="insight-highlight-row">
            <div className="insight-highlight-box">
              <span>Analiz Türü</span>
              <strong>Salon Verisi + Üye Hedefi</strong>
            </div>
            <div className="insight-highlight-box">
              <span>Öneri Sayısı</span>
              <strong>{data.insights.length} başlık</strong>
            </div>
          </div>
        </article>
      ) : null}

      <div className="recommendation-grid">
        {otherInsights.map((insight) => (
          <article key={insight.title} className="insight-card">
            <div className="card-title-row">
              <IconBadge symbol="◇" tone="teal" size="sm" />
              <span className="eyebrow">Yapay Zekâ Destekli Öneri</span>
            </div>
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
