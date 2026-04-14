import type { RecommendationOverview } from "../lib/types";
import { IconBadge } from "./IconBadge";

type Props = {
  data: RecommendationOverview;
};

export function RecommendationsPanel({ data }: Props) {
  return (
    <section className="recommendation-grid">
      {data.insights.map((insight) => (
        <article key={insight.title} className="insight-card">
          <div className="card-title-row">
            <IconBadge symbol="◇" tone="teal" size="sm" />
            <span className="eyebrow">Yapay Zekâ Destekli Öneri</span>
          </div>
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
        </article>
      ))}
    </section>
  );
}
