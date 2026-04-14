import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { apiRequest } from "../lib/api";
import type { PaymentOverview, User } from "../lib/types";

type Props = {
  data: PaymentOverview;
  user: User;
  onRefresh: () => Promise<void>;
};

type CardForm = {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
};

const emptyCardForm: CardForm = {
  cardHolderName: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvc: ""
};

function formatCurrency(value?: string | null) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString("tr-TR")} TL`;
}

function labelForCategory(category?: string | null, membershipMonths?: number | null, sessionCount?: number | null) {
  switch (category) {
    case "membership":
      return membershipMonths ? `${membershipMonths} Aylık Üyelik` : "Üyelik";
    case "personal_training":
      return sessionCount ? `${sessionCount} Seans Özel Ders` : "Özel Ders";
    case "mobility_session":
      return "Mobilite Seansı";
    default:
      return category ?? "Ödeme";
  }
}

function methodLabel(method?: string | null, last4?: string | null) {
  if (method === "credit_card") {
    return last4 ? `Kredi Kartı •••• ${last4}` : "Kredi Kartı";
  }

  return method ?? "Belirtilmedi";
}

function statusLabel(status?: string | null) {
  if (status === "paid") return "Ödendi";
  if (status === "pending") return "Bekliyor";
  return status ?? "Bilinmiyor";
}

function formatCardNumberInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatMonthInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  return digits;
}

function formatYearInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits;
}

function formatCvcInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function PaymentsPanel({ data, user, onRefresh }: Props) {
  const initialPlanCode = data.membershipPlans[0]?.code ?? "";
  const initialTrainerId = data.personalTrainingOffers[0]?.trainerId ?? "";
  const initialSessionCount = data.personalTrainingOffers[0]?.packages[0]?.sessionCount ?? 1;

  const [membershipPlanCode, setMembershipPlanCode] = useState(initialPlanCode);
  const [membershipCard, setMembershipCard] = useState<CardForm>(emptyCardForm);
  const [personalTrainerId, setPersonalTrainerId] = useState(initialTrainerId);
  const [personalSessionCount, setPersonalSessionCount] = useState(initialSessionCount);
  const [personalCard, setPersonalCard] = useState<CardForm>(emptyCardForm);
  const [membershipMessage, setMembershipMessage] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [membershipSaving, setMembershipSaving] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [adminMemberFilter, setAdminMemberFilter] = useState("");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("all");

  const selectedMembershipPlan = data.membershipPlans.find((plan) => plan.code === membershipPlanCode);
  const selectedTrainer = data.personalTrainingOffers.find((trainer) => trainer.trainerId === personalTrainerId);
  const selectedPackage =
    selectedTrainer?.packages.find((item) => item.sessionCount === personalSessionCount) ??
    selectedTrainer?.packages[0];

  const summaryCards =
    user.role === "member"
      ? [
          { label: "Toplam Ödeme", value: formatCurrency(data.summary.total_paid) },
          { label: "Üyelik Harcaması", value: formatCurrency(data.summary.membership_total) },
          { label: "Özel Ders Harcaması", value: formatCurrency(data.summary.special_lesson_total) },
          {
            label: "Aktif Üyelik Sonu",
            value: data.summary.membership_end_date
              ? new Date(data.summary.membership_end_date).toLocaleDateString("tr-TR")
              : "Tanımlı Değil"
          }
        ]
      : user.role === "trainer"
        ? [
            { label: "Toplam Kazanç", value: formatCurrency(data.summary.total_earnings) },
            { label: "Özel Ders Cirosu", value: formatCurrency(data.summary.session_revenue) },
            { label: "Satılan Seans", value: data.summary.sold_sessions ?? "0" },
            { label: "Salon Payı", value: formatCurrency(data.summary.gym_cut) }
          ]
        : [
            { label: "Brüt Gelir", value: formatCurrency(data.summary.gross_revenue) },
            { label: "Üyelik Geliri", value: formatCurrency(data.summary.membership_revenue) },
            { label: "Özel Ders Geliri", value: formatCurrency(data.summary.special_lesson_revenue) },
            { label: "Antrenör Ödemesi", value: formatCurrency(data.summary.trainer_payouts) }
          ];

  const visibleAdminPayments = useMemo(() => {
    if (user.role !== "admin") {
      return data.recentPayments;
    }

    return data.recentPayments.filter((payment) => {
      const matchMember = adminMemberFilter
        ? payment.member_name?.toLocaleLowerCase("tr-TR").includes(adminMemberFilter.toLocaleLowerCase("tr-TR"))
        : true;
      const matchCategory =
        adminCategoryFilter === "all" ? true : payment.payment_category === adminCategoryFilter;

      return matchMember && matchCategory;
    });
  }, [adminCategoryFilter, adminMemberFilter, data.recentPayments, user.role]);

  function updateCard(
    setter: Dispatch<SetStateAction<CardForm>>,
    field: keyof CardForm,
    value: string
  ) {
    setter((current) => ({ ...current, [field]: value }));
  }

  async function submitMembershipPayment() {
    try {
      setMembershipSaving(true);
      setMembershipMessage("");
      const response = await apiRequest<{ message: string; invoiceNo: string }>("/payments/membership", {
        method: "POST",
        body: JSON.stringify({
          planCode: membershipPlanCode,
          ...membershipCard
        })
      });
      setMembershipCard(emptyCardForm);
      setMembershipMessage(`${response.message} Fatura No: ${response.invoiceNo}`);
      await onRefresh();
    } catch (error) {
      setMembershipMessage(error instanceof Error ? error.message : "Ödeme alınamadı.");
    } finally {
      setMembershipSaving(false);
    }
  }

  async function submitPersonalTrainingPayment() {
    try {
      setPersonalSaving(true);
      setPersonalMessage("");
      const response = await apiRequest<{ message: string; invoiceNo: string }>("/payments/personal-training", {
        method: "POST",
        body: JSON.stringify({
          trainerId: personalTrainerId,
          sessionCount: personalSessionCount,
          ...personalCard
        })
      });
      setPersonalCard(emptyCardForm);
      setPersonalMessage(`${response.message} Fatura No: ${response.invoiceNo}`);
      await onRefresh();
    } catch (error) {
      setPersonalMessage(error instanceof Error ? error.message : "Ödeme alınamadı.");
    } finally {
      setPersonalSaving(false);
    }
  }

  return (
    <section className="panel-stack">
      <div className="mini-stats-grid mini-stats-grid--four">
        {summaryCards.map((card) => (
          <article key={card.label} className="mini-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      {user.role === "member" ? (
        <div className="payment-form-grid">
          <div className="form-card">
            <div className="panel-heading">
              <div>
                <h3>Üyelik Ödemesi</h3>
                <p>1 aylık, 3 aylık, 6 aylık veya yıllık paketlerden birini kartınla öde.</p>
              </div>
            </div>

            <div className="program-form-grid">
              <label>
                Paket
                <select value={membershipPlanCode} onChange={(event) => setMembershipPlanCode(event.target.value)}>
                  {data.membershipPlans.map((plan) => (
                    <option key={plan.code} value={plan.code}>
                      {plan.label} - {formatCurrency(plan.amount)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kart Üzerindeki Ad Soyad
                <input
                  value={membershipCard.cardHolderName}
                  onChange={(event) => updateCard(setMembershipCard, "cardHolderName", event.target.value)}
                />
              </label>
              <label className="span-2">
                Kart Numarası
                <input
                  value={membershipCard.cardNumber}
                  onChange={(event) =>
                    updateCard(
                      setMembershipCard,
                      "cardNumber",
                      formatCardNumberInput(event.target.value)
                    )
                  }
                  placeholder="5555 4444 3333 2222"
                />
              </label>
              <label>
                Son Kullanma Ayı
                <input
                  value={membershipCard.expiryMonth}
                  onChange={(event) =>
                    updateCard(setMembershipCard, "expiryMonth", formatMonthInput(event.target.value))
                  }
                  placeholder="08"
                />
              </label>
              <label>
                Son Kullanma Yılı
                <input
                  value={membershipCard.expiryYear}
                  onChange={(event) =>
                    updateCard(setMembershipCard, "expiryYear", formatYearInput(event.target.value))
                  }
                  placeholder="2027"
                />
              </label>
              <label>
                Güvenlik Kodu
                <input
                  value={membershipCard.cvc}
                  onChange={(event) =>
                    updateCard(setMembershipCard, "cvc", formatCvcInput(event.target.value))
                  }
                  placeholder="123"
                />
              </label>
            </div>

            <div className="payment-summary-box">
              <span>Seçilen Paket</span>
              <strong>
                {selectedMembershipPlan?.label ?? "Paket seç"} -{" "}
                {selectedMembershipPlan ? formatCurrency(selectedMembershipPlan.amount) : "0 TL"}
              </strong>
            </div>

            <div className="action-row">
              <button
                type="button"
                disabled={!membershipPlanCode || membershipSaving}
                onClick={submitMembershipPayment}
              >
                {membershipSaving ? "Ödeme Alınıyor..." : "Üyelik Ödemesini Tamamla"}
              </button>
            </div>
            {membershipMessage ? <p className="helper-text">{membershipMessage}</p> : null}
          </div>

          <div className="form-card">
            <div className="panel-heading">
              <div>
                <h3>Özel Ders Satın Al</h3>
                <p>Antrenör seç, seans paketini belirle ve kartınla özel ders ödemesini tamamla.</p>
              </div>
            </div>

            <div className="program-form-grid">
              <label>
                Antrenör
                <select
                  value={personalTrainerId}
                  onChange={(event) => {
                    const trainerId = event.target.value;
                    setPersonalTrainerId(trainerId);
                    const nextTrainer = data.personalTrainingOffers.find((item) => item.trainerId === trainerId);
                    setPersonalSessionCount(nextTrainer?.packages[0]?.sessionCount ?? 1);
                  }}
                >
                  {data.personalTrainingOffers.map((trainer) => (
                    <option key={trainer.trainerId} value={trainer.trainerId}>
                      {trainer.trainerName} - Saatlik {formatCurrency(trainer.hourlyRate)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Paket
                <select
                  value={String(personalSessionCount)}
                  onChange={(event) => setPersonalSessionCount(Number(event.target.value))}
                >
                  {selectedTrainer?.packages.map((item) => (
                    <option key={item.sessionCount} value={item.sessionCount}>
                      {item.label} - {formatCurrency(item.amount)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-2">
                Kart Üzerindeki Ad Soyad
                <input
                  value={personalCard.cardHolderName}
                  onChange={(event) => updateCard(setPersonalCard, "cardHolderName", event.target.value)}
                />
              </label>
              <label className="span-2">
                Kart Numarası
                <input
                  value={personalCard.cardNumber}
                  onChange={(event) =>
                    updateCard(
                      setPersonalCard,
                      "cardNumber",
                      formatCardNumberInput(event.target.value)
                    )
                  }
                  placeholder="5555 4444 3333 2222"
                />
              </label>
              <label>
                Son Kullanma Ayı
                <input
                  value={personalCard.expiryMonth}
                  onChange={(event) =>
                    updateCard(setPersonalCard, "expiryMonth", formatMonthInput(event.target.value))
                  }
                  placeholder="08"
                />
              </label>
              <label>
                Son Kullanma Yılı
                <input
                  value={personalCard.expiryYear}
                  onChange={(event) =>
                    updateCard(setPersonalCard, "expiryYear", formatYearInput(event.target.value))
                  }
                  placeholder="2027"
                />
              </label>
              <label>
                Güvenlik Kodu
                <input
                  value={personalCard.cvc}
                  onChange={(event) =>
                    updateCard(setPersonalCard, "cvc", formatCvcInput(event.target.value))
                  }
                  placeholder="123"
                />
              </label>
            </div>

            <div className="payment-summary-box">
              <span>Seçilen Özel Ders</span>
              <strong>
                {selectedTrainer?.trainerName ?? "Antrenör seç"} -{" "}
                {selectedPackage ? `${selectedPackage.label} / ${formatCurrency(selectedPackage.amount)}` : "0 TL"}
              </strong>
            </div>

            <div className="action-row">
              <button
                type="button"
                disabled={!personalTrainerId || personalSaving}
                onClick={submitPersonalTrainingPayment}
              >
                {personalSaving ? "Ödeme Alınıyor..." : "Özel Ders Ödemesini Tamamla"}
              </button>
            </div>
            {personalMessage ? <p className="helper-text">{personalMessage}</p> : null}
          </div>
        </div>
      ) : null}

      {user.role === "admin" ? (
        <div className="table-card">
          <div className="panel-heading">
            <div>
              <h3>Ödeme Takibi</h3>
            </div>
          </div>
          <div className="payments-filter-grid">
            <label>
              Üye Ara
              <input
                value={adminMemberFilter}
                onChange={(event) => setAdminMemberFilter(event.target.value)}
                placeholder="Örn: Ece"
              />
            </label>
            <label>
              Ödeme Türü
              <select value={adminCategoryFilter} onChange={(event) => setAdminCategoryFilter(event.target.value)}>
                <option value="all">Tümü</option>
                <option value="membership">Üyelik</option>
                <option value="personal_training">Özel Ders</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="table-card">
        <div className="panel-heading">
          <div>
            <h3>{user.role === "admin" ? "Tüm Ödemeler" : "Ödeme Geçmişi"}</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>{user.role === "member" ? "Tür" : "Üye"}</th>
                {user.role !== "member" ? <th>İşlem</th> : null}
                <th>Tutar</th>
                {user.role === "trainer" ? <th>Payın</th> : null}
                {user.role === "admin" ? <th>Salon Payı</th> : null}
                {user.role === "admin" ? <th>Antrenör Payı</th> : null}
                <th>Kart</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {(user.role === "admin" ? visibleAdminPayments : data.recentPayments).map((payment, index) => (
                <tr key={payment.id ?? String(index)}>
                  <td>
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td>
                    {user.role === "member"
                      ? labelForCategory(payment.payment_category, payment.membership_months, payment.session_count)
                      : payment.member_name ?? "-"}
                  </td>
                  {user.role !== "member" ? (
                    <td>
                      {labelForCategory(payment.payment_category, payment.membership_months, payment.session_count)}
                      {payment.trainer_name && user.role === "admin" ? ` / ${payment.trainer_name}` : ""}
                    </td>
                  ) : null}
                  <td>{formatCurrency(payment.amount)}</td>
                  {user.role === "trainer" ? <td>{formatCurrency(payment.trainer_share)}</td> : null}
                  {user.role === "admin" ? <td>{formatCurrency(payment.gym_share)}</td> : null}
                  {user.role === "admin" ? <td>{formatCurrency(payment.trainer_share)}</td> : null}
                  <td>{methodLabel(payment.payment_method, payment.card_last4)}</td>
                  <td>{statusLabel(payment.payment_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
