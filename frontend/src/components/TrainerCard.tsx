import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { Trainer } from "../lib/types";
import { cevirMetin } from "../lib/translate";
import { IconBadge } from "./IconBadge";

type Props = {
  trainer: Trainer;
  onRefresh: () => Promise<void>;
  canReview?: boolean;
};

function puanSinifi(rating: number) {
  if (rating >= 5) return "rating-pill rating-pill--good";
  if (rating >= 3) return "rating-pill rating-pill--mid";
  return "rating-pill rating-pill--bad";
}

export function TrainerCard({ trainer, onRefresh, canReview = true }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitReview() {
    try {
      setLoading(true);
      setMessage("");
      await apiRequest(`/trainers/${trainer.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment })
      });
      setComment("");
      setMessage("Yorum kaydedildi.");
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="trainer-card">
      <div className="trainer-header">
        <img src={trainer.avatar_url} alt={trainer.full_name} />
        <div>
          <div className="card-title-row">
            <IconBadge symbol="●" tone="teal" size="sm" />
            <h3>{trainer.full_name}</h3>
          </div>
          <p>{cevirMetin(trainer.title)}</p>
          <small>
            {trainer.rating_average} puan · {trainer.rating_count} değerlendirme
          </small>
        </div>
        <div className="price-tag">{trainer.hourly_rate} TL</div>
      </div>

      <p className="trainer-bio">{trainer.bio}</p>

      <div className="chip-row">
        {trainer.specialties.map((item) => (
          <span key={item} className="chip">
            {cevirMetin(item)}
          </span>
        ))}
      </div>

      <div className="certificate-list">
        {trainer.certificates.map((certificate) => (
          <span key={`${certificate.name}-${certificate.issuer}`} className="certificate-item">
            {cevirMetin(certificate.name)} · {cevirMetin(certificate.issuer)}
          </span>
        ))}
      </div>

      <div className="review-box">
        <div className="card-title-row">
          <IconBadge symbol="◇" tone="coral" size="sm" />
          <h4>Yorum bırak</h4>
        </div>
        <div className="review-form-row">
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} yıldız
              </option>
            ))}
          </select>
          <button disabled={!canReview || loading || comment.length < 5} onClick={submitReview}>
            {loading ? "Kaydediliyor..." : "Yorumu Gönder"}
          </button>
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Antrenör hakkındaki deneyimini yaz..."
          rows={3}
          disabled={!canReview}
        />
        {!canReview ? <small>Sadece üye hesabı ile yorum ve puan verebilirsin.</small> : null}
        {message ? <small>{message}</small> : null}
      </div>

      <div className="review-list">
        {trainer.reviews.slice(0, 2).map((review, index) => (
          <div className="review-item" key={`${trainer.id}-${index}`}>
            <div className="review-item__top">
              <div className="review-item__identity">
                <IconBadge
                  symbol={review.rating >= 4 ? "●" : review.rating >= 3 ? "▲" : "●"}
                  tone={review.rating >= 4 ? "teal" : review.rating >= 3 ? "gold" : "coral"}
                  size="sm"
                />
                <strong>{review.full_name}</strong>
              </div>
              <span className={puanSinifi(review.rating)}>{review.rating}/5</span>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
