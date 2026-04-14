import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { GymClass } from "../lib/types";
import { cevirMetin } from "../lib/translate";
import { IconBadge } from "./IconBadge";

type Props = {
  item: GymClass;
  onRefresh: () => Promise<void>;
  canBook?: boolean;
};

export function ClassCard({ item, onRefresh, canBook = true }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  async function reserve() {
    try {
      await apiRequest(`/classes/${item.id}/bookings`, {
        method: "POST"
      });
      await onRefresh();
      alert("Ders rezerve edildi.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Rezervasyon yapılamadı.");
    }
  }

  return (
    <article className="class-card">
      <div className="class-card__header">
        <div>
          <div className="card-title-row">
            <IconBadge symbol="●" tone="gold" size="sm" />
            <h3>{cevirMetin(item.name)}</h3>
          </div>
          <p>
            {cevirMetin(item.category)} · {item.trainer_name}
          </p>
        </div>
        <span>
          {item.reserved_count}/{item.capacity}
        </span>
      </div>
      <p>{cevirMetin(item.description)}</p>
      <small>
        {new Date(item.starts_at).toLocaleString("tr-TR")} · {cevirMetin(item.room_name)}
      </small>
      {showDetails ? (
        <div className="class-detail-box">
          <span>Eğitmen: {item.trainer_name}</span>
          <span>Kategori: {cevirMetin(item.category)}</span>
          <span>Kontenjan: {item.reserved_count}/{item.capacity}</span>
        </div>
      ) : null}
      {canBook ? (
        <button disabled={item.is_booked} onClick={reserve}>
          {item.is_booked ? "Rezervasyon Yapıldı" : "Yerini Ayırt"}
        </button>
      ) : (
        <button className="ghost-button" onClick={() => setShowDetails((current) => !current)}>
          {showDetails ? "Detayı Gizle" : "Detayları Gör"}
        </button>
      )}
    </article>
  );
}
