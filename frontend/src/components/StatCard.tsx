type Props = {
  label: string;
  value: string | number;
  accent?: "orange" | "blue" | "green";
};

export function StatCard({ label, value, accent = "orange" }: Props) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
