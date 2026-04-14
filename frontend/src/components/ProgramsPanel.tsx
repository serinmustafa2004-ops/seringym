import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { ProgramOverview, User } from "../lib/types";
import { cevirMetin } from "../lib/translate";

type Props = {
  data: ProgramOverview;
  user: User;
  onRefresh: () => Promise<void>;
};

type DraftDay = {
  dayIndex: number;
  dayLabel: string;
  focusArea: string;
  exerciseName: string;
  sets: string;
  reps: string;
  restSeconds: number;
  notes: string;
};

const emptyDay = (): DraftDay => ({
  dayIndex: 1,
  dayLabel: "Pazartesi",
  focusArea: "",
  exerciseName: "",
  sets: "3",
  reps: "12",
  restSeconds: 60,
  notes: ""
});

function durumEtiketi(status: string) {
  if (status === "active") return "Aktif";
  return "Taslak";
}

export function ProgramsPanel({ data, user, onRefresh }: Props) {
  const canCreate = user.role === "trainer" || user.role === "admin";
  const [memberId, setMemberId] = useState(data.assignableMembers[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [goalSummary, setGoalSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<DraftDay[]>([emptyDay()]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateDay(index: number, field: keyof DraftDay, value: string | number) {
    setDays((current) =>
      current.map((day, dayIndex) => (dayIndex === index ? { ...day, [field]: value } : day))
    );
  }

  async function createProgram() {
    try {
      setSaving(true);
      setMessage("");
      await apiRequest("/programs", {
        method: "POST",
        body: JSON.stringify({ memberId, title, goalSummary, notes, days })
      });
      setTitle("");
      setGoalSummary("");
      setNotes("");
      setDays([emptyDay()]);
      setMessage("Program kaydedildi.");
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Program kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel-stack">
      <div className="mini-stats-grid">
        <article className="mini-stat-card">
          <span>Toplam Program</span>
          <strong>{data.programs.length}</strong>
        </article>
        <article className="mini-stat-card">
          <span>Aktif Üye Planı</span>
          <strong>{data.programs.filter((program) => program.status === "active").length}</strong>
        </article>
        <article className="mini-stat-card">
          <span>Hazır Egzersiz Satırı</span>
          <strong>{data.programs.reduce((sum, program) => sum + program.days.length, 0)}</strong>
        </article>
      </div>

      {canCreate ? (
        <div className="form-card">
          <div className="panel-heading">
            <div>
              <h3>Antrenman Programı Yaz</h3>
              <p>Üyeye yeni program oluştur ve egzersiz günlerini tek ekrandan ata.</p>
            </div>
          </div>

          <div className="program-form-grid">
            <label>
              Üye
              <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
                {data.assignableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Program Başlığı
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="span-2">
              Hedef Özeti
              <textarea value={goalSummary} onChange={(event) => setGoalSummary(event.target.value)} rows={3} />
            </label>
            <label className="span-2">
              Notlar
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
            </label>
          </div>

          <div className="draft-days">
            {days.map((day, index) => (
              <div className="draft-day-card" key={index}>
                <div className="draft-day-grid">
                  <label>
                    Gün No
                    <input
                      type="number"
                      value={day.dayIndex}
                      onChange={(event) => updateDay(index, "dayIndex", Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Gün Adı
                    <input
                      value={day.dayLabel}
                      onChange={(event) => updateDay(index, "dayLabel", event.target.value)}
                    />
                  </label>
                  <label>
                    Odak Bölge
                    <input
                      value={day.focusArea}
                      onChange={(event) => updateDay(index, "focusArea", event.target.value)}
                    />
                  </label>
                  <label>
                    Egzersiz
                    <input
                      value={day.exerciseName}
                      onChange={(event) => updateDay(index, "exerciseName", event.target.value)}
                    />
                  </label>
                  <label>
                    Set
                    <input value={day.sets} onChange={(event) => updateDay(index, "sets", event.target.value)} />
                  </label>
                  <label>
                    Tekrar
                    <input value={day.reps} onChange={(event) => updateDay(index, "reps", event.target.value)} />
                  </label>
                  <label>
                    Dinlenme
                    <input
                      type="number"
                      value={day.restSeconds}
                      onChange={(event) => updateDay(index, "restSeconds", Number(event.target.value))}
                    />
                  </label>
                  <label className="span-2">
                    Not
                    <input value={day.notes} onChange={(event) => updateDay(index, "notes", event.target.value)} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="action-row">
            <button type="button" className="ghost-button" onClick={() => setDays((current) => [...current, emptyDay()])}>
              Yeni Gün Ekle
            </button>
            <button
              type="button"
              disabled={!memberId || !title || !goalSummary || days.some((day) => !day.focusArea || !day.exerciseName) || saving}
              onClick={createProgram}
            >
              {saving ? "Kaydediliyor..." : "Programı Kaydet"}
            </button>
          </div>
          {message ? <p className="helper-text">{message}</p> : null}
        </div>
      ) : null}

      <div className="programs-grid">
        {data.programs.map((program) => (
          <article key={program.id} className="program-card">
            <div className="program-card__top">
              <div>
                <h3>{program.title}</h3>
                <p>{program.goal_summary}</p>
              </div>
              <span className="program-status">{durumEtiketi(program.status)}</span>
            </div>
            <div className="program-meta">
              <span>Üye: {program.member_name}</span>
              <span>Antrenör: {program.trainer_name}</span>
              <span>{new Date(program.created_at).toLocaleDateString("tr-TR")}</span>
            </div>
            {program.notes ? <p className="program-note">{program.notes}</p> : null}
            <div className="exercise-list">
              {program.days.map((day, index) => (
                <div key={`${program.id}-${index}`} className="exercise-item">
                  <strong>
                    {cevirMetin(day.day_label)} · {cevirMetin(day.focus_area)}
                  </strong>
                  <span>
                    {cevirMetin(day.exercise_name)} - {day.sets} set x {day.reps} tekrar
                  </span>
                  <small>Dinlenme: {day.rest_seconds} sn</small>
                  {day.notes ? <small>Koç notu: {day.notes}</small> : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
