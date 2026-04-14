import { PropsWithChildren } from "react";
import { IconBadge } from "./IconBadge";

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <div className="card-title-row">
      <IconBadge symbol="◇" tone="gold" size="sm" />
      <h2 className="section-title">{children}</h2>
    </div>
  );
}
