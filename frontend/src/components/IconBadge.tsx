type Props = {
  symbol: string;
  tone?: "gold" | "teal" | "coral" | "slate";
  size?: "sm" | "md";
};

export function IconBadge({ symbol, tone = "gold", size = "md" }: Props) {
  return <span className={`icon-badge icon-badge--${tone} icon-badge--${size}`}>{symbol}</span>;
}
