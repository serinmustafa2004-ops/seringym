import { getClient, query } from "../config/db.js";
import { bildirimOlustur, topluBildirimOlustur } from "./notifications.service.js";

type UserRole = "member" | "trainer" | "admin";

type MembershipPlan = {
  code: string;
  label: string;
  months: number;
  amount: number;
  membershipType: "monthly" | "yearly";
};

type CardPayload = {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
};

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  { code: "aylik_1", label: "1 Aylık", months: 1, amount: 2250, membershipType: "monthly" },
  { code: "aylik_3", label: "3 Aylık", months: 3, amount: 6300, membershipType: "monthly" },
  { code: "aylik_6", label: "6 Aylık", months: 6, amount: 11850, membershipType: "monthly" },
  { code: "yillik_12", label: "Yıllık", months: 12, amount: 21900, membershipType: "yearly" }
];

const SESSION_PACKAGES = [
  { sessionCount: 1, multiplier: 1, label: "1 Seans" },
  { sessionCount: 4, multiplier: 0.94, label: "4 Seans" },
  { sessionCount: 8, multiplier: 0.88, label: "8 Seans" }
];

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function createInvoiceNo(prefix: string) {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${stamp}-${random}`;
}

function validateCard(card: CardPayload) {
  const digits = card.cardNumber.replace(/\D/g, "");
  const month = Number(card.expiryMonth);
  const year = Number(card.expiryYear);
  const cvc = card.cvc.replace(/\D/g, "");

  if (card.cardHolderName.trim().length < 5) {
    throw new Error("Kart üzerindeki ad soyad bilgisini gir.");
  }

  if (digits.length < 16) {
    throw new Error("Kart numarası en az 16 haneli olmalı.");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Geçerli bir son kullanma ayı gir.");
  }

  if (!Number.isInteger(year) || year < new Date().getFullYear()) {
    throw new Error("Geçerli bir son kullanma yılı gir.");
  }

  if (cvc.length < 3) {
    throw new Error("Güvenlik kodu en az 3 haneli olmalı.");
  }

  return {
    last4: digits.slice(-4),
    holder: card.cardHolderName.trim()
  };
}

export async function getPaymentOverview(userId: string, role: UserRole) {
  if (role === "member") {
    const [summaryResult, recentResult, membershipResult, trainerOffersResult] = await Promise.all([
      query<{
        total_paid: string;
        payment_count: string;
        last_payment_at: string | null;
        membership_total: string;
        special_lesson_total: string;
      }>(
        `
          SELECT
            COALESCE(SUM(amount), 0)::text AS total_paid,
            COUNT(*)::text AS payment_count,
            MAX(paid_at)::text AS last_payment_at,
            COALESCE(SUM(amount) FILTER (WHERE payment_category = 'membership'), 0)::text AS membership_total,
            COALESCE(SUM(amount) FILTER (WHERE payment_category = 'personal_training'), 0)::text AS special_lesson_total
          FROM payments
          WHERE user_id = $1 AND payment_status = 'paid'
        `,
        [userId]
      ),
      query<{
        id: string;
        amount: string;
        payment_category: string;
        payment_method: string;
        payment_status: string;
        description: string | null;
        paid_at: string;
        invoice_no: string | null;
        card_last4: string | null;
        membership_months: number | null;
        session_count: number | null;
        trainer_name: string | null;
      }>(
        `
          SELECT
            p.id,
            p.amount::text,
            p.payment_category,
            p.payment_method,
            p.payment_status,
            p.description,
            p.paid_at::text,
            p.invoice_no,
            p.card_last4,
            p.membership_months,
            p.session_count,
            trainer_user.full_name AS trainer_name
          FROM payments p
          LEFT JOIN trainers t ON t.id = p.trainer_id
          LEFT JOIN users trainer_user ON trainer_user.id = t.user_id
          WHERE p.user_id = $1
          ORDER BY p.paid_at DESC
        `,
        [userId]
      ),
      query<{
        membership_type: string | null;
        end_date: string | null;
      }>(
        `
          SELECT membership_type::text, end_date::text
          FROM memberships
          WHERE user_id = $1 AND is_active = TRUE
          ORDER BY end_date DESC
          LIMIT 1
        `,
        [userId]
      ),
      query<{
        trainer_id: string;
        trainer_name: string;
        title: string;
        hourly_rate: string;
      }>(
        `
          SELECT
            t.id AS trainer_id,
            u.full_name AS trainer_name,
            t.title,
            t.hourly_rate::text
          FROM trainers t
          JOIN users u ON u.id = t.user_id
          WHERE t.is_marketplace_visible = TRUE
          ORDER BY t.rating_average DESC, u.full_name ASC
        `
      )
    ]);

    return {
      role,
      summary: {
        ...(summaryResult.rows[0] ?? {
          total_paid: "0",
          payment_count: "0",
          last_payment_at: null,
          membership_total: "0",
          special_lesson_total: "0"
        }),
        membership_type: membershipResult.rows[0]?.membership_type ?? null,
        membership_end_date: membershipResult.rows[0]?.end_date ?? null
      },
      recentPayments: recentResult.rows,
      membershipPlans: MEMBERSHIP_PLANS.map((plan) => ({
        code: plan.code,
        label: plan.label,
        months: plan.months,
        amount: String(plan.amount)
      })),
      personalTrainingOffers: trainerOffersResult.rows.map((trainer) => {
        const hourlyRate = Number(trainer.hourly_rate);
        return {
          trainerId: trainer.trainer_id,
          trainerName: trainer.trainer_name,
          title: trainer.title,
          hourlyRate: trainer.hourly_rate,
          packages: SESSION_PACKAGES.map((item) => ({
            sessionCount: item.sessionCount,
            label: item.label,
            amount: String(roundCurrency(hourlyRate * item.sessionCount * item.multiplier))
          }))
        };
      })
    };
  }

  if (role === "trainer") {
    const trainerResult = await query<{ trainer_id: string }>(
      `SELECT id AS trainer_id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    const trainerId = trainerResult.rows[0]?.trainer_id;
    if (!trainerId) {
      throw new Error("Antrenör profili bulunamadı.");
    }

    const [summaryResult, recentResult] = await Promise.all([
      query<{
        total_earnings: string;
        session_revenue: string;
        gym_cut: string;
        payment_count: string;
        sold_sessions: string;
      }>(
        `
          SELECT
            COALESCE(SUM(trainer_share), 0)::text AS total_earnings,
            COALESCE(SUM(amount) FILTER (WHERE payment_category = 'personal_training'), 0)::text AS session_revenue,
            COALESCE(SUM(gym_share), 0)::text AS gym_cut,
            COUNT(*)::text AS payment_count,
            COALESCE(SUM(session_count), 0)::text AS sold_sessions
          FROM payments
          WHERE trainer_id = $1 AND payment_status = 'paid'
        `,
        [trainerId]
      ),
      query<{
        id: string;
        member_name: string;
        amount: string;
        trainer_share: string;
        payment_category: string;
        payment_method: string;
        payment_status: string;
        session_count: number | null;
        card_last4: string | null;
        invoice_no: string | null;
        paid_at: string;
      }>(
        `
          SELECT
            p.id,
            u.full_name AS member_name,
            p.amount::text,
            p.trainer_share::text,
            p.payment_category,
            p.payment_method,
            p.payment_status,
            p.session_count,
            p.card_last4,
            p.invoice_no,
            p.paid_at::text
          FROM payments p
          JOIN users u ON u.id = p.user_id
          WHERE p.trainer_id = $1
          ORDER BY p.paid_at DESC
        `,
        [trainerId]
      )
    ]);

    return {
      role,
      summary: summaryResult.rows[0] ?? {
        total_earnings: "0",
        session_revenue: "0",
        gym_cut: "0",
        payment_count: "0",
        sold_sessions: "0"
      },
      recentPayments: recentResult.rows,
      membershipPlans: [],
      personalTrainingOffers: []
    };
  }

  const [summaryResult, recentResult] = await Promise.all([
    query<{
      gross_revenue: string;
      gym_revenue: string;
      trainer_payouts: string;
      payment_count: string;
      membership_revenue: string;
      special_lesson_revenue: string;
    }>(
      `
        SELECT
          COALESCE(SUM(amount), 0)::text AS gross_revenue,
          COALESCE(SUM(gym_share), 0)::text AS gym_revenue,
          COALESCE(SUM(trainer_share), 0)::text AS trainer_payouts,
          COUNT(*)::text AS payment_count,
          COALESCE(SUM(amount) FILTER (WHERE payment_category = 'membership'), 0)::text AS membership_revenue,
          COALESCE(SUM(amount) FILTER (WHERE payment_category = 'personal_training'), 0)::text AS special_lesson_revenue
        FROM payments
        WHERE payment_status = 'paid'
      `
    ),
    query<{
      id: string;
      member_name: string;
      trainer_name: string | null;
      amount: string;
      gym_share: string;
      trainer_share: string;
      payment_category: string;
      payment_method: string;
      payment_status: string;
      description: string | null;
      invoice_no: string | null;
      card_last4: string | null;
      membership_months: number | null;
      session_count: number | null;
      paid_at: string;
    }>(
      `
        SELECT
          p.id,
          member_user.full_name AS member_name,
          trainer_user.full_name AS trainer_name,
          p.amount::text,
          p.gym_share::text,
          p.trainer_share::text,
          p.payment_category,
          p.payment_method,
          p.payment_status,
          p.description,
          p.invoice_no,
          p.card_last4,
          p.membership_months,
          p.session_count,
          p.paid_at::text
        FROM payments p
        JOIN users member_user ON member_user.id = p.user_id
        LEFT JOIN trainers t ON t.id = p.trainer_id
        LEFT JOIN users trainer_user ON trainer_user.id = t.user_id
        ORDER BY p.paid_at DESC
      `
    )
  ]);

  return {
    role,
    summary: summaryResult.rows[0] ?? {
      gross_revenue: "0",
      gym_revenue: "0",
      trainer_payouts: "0",
      payment_count: "0",
      membership_revenue: "0",
      special_lesson_revenue: "0"
    },
    recentPayments: recentResult.rows,
    membershipPlans: [],
    personalTrainingOffers: []
  };
}

export async function createMembershipPayment(
  userId: string,
  payload: CardPayload & { planCode: string }
) {
  const plan = MEMBERSHIP_PLANS.find((item) => item.code === payload.planCode);
  if (!plan) {
    throw new Error("Geçerli bir üyelik paketi seç.");
  }

  const card = validateCard(payload);
  const client = await getClient();
  const invoiceNo = createInvoiceNo("SGY-UY");

  try {
    await client.query("BEGIN");
    await client.query(
      `
        UPDATE memberships
        SET is_active = FALSE
        WHERE user_id = $1 AND end_date < CURRENT_DATE
      `,
      [userId]
    );

    const membershipResult = await client.query<{
      id: string;
      end_date: string;
    }>(
      `
        SELECT id, end_date::text
        FROM memberships
        WHERE user_id = $1 AND is_active = TRUE
        ORDER BY end_date DESC
        LIMIT 1
        FOR UPDATE
      `,
      [userId]
    );

    await client.query(
      `
        INSERT INTO payments (
          user_id,
          amount,
          gym_share,
          trainer_share,
          currency,
          payment_category,
          payment_method,
          payment_status,
          invoice_no,
          membership_months,
          card_holder_name,
          card_last4,
          description
        )
        VALUES ($1, $2, $2, 0, 'TRY', 'membership', 'credit_card', 'paid', $3, $4, $5, $6, $7)
      `,
      [
        userId,
        plan.amount,
        invoiceNo,
        plan.months,
        card.holder,
        card.last4,
        `${plan.label} üyelik ödemesi`
      ]
    );

    if (membershipResult.rows[0]) {
      await client.query(
        `
          UPDATE memberships
          SET
            end_date = (end_date + ($2 || ' month')::interval)::date,
            membership_type = $3,
            monthly_price = $4,
            is_active = TRUE
          WHERE id = $1
        `,
        [
          membershipResult.rows[0].id,
          plan.months,
          plan.membershipType,
          roundCurrency(plan.amount / plan.months)
        ]
      );
    } else {
      await client.query(
        `
          INSERT INTO memberships (
            user_id,
            membership_type,
            start_date,
            end_date,
            is_active,
            monthly_price,
            remaining_freezes
          )
          VALUES (
            $1,
            $2,
            CURRENT_DATE,
            (CURRENT_DATE + ($3 || ' month')::interval)::date,
            TRUE,
            $4,
            CASE WHEN $3 >= 6 THEN 2 ELSE 1 END
          )
        `,
        [
          userId,
          plan.membershipType,
          plan.months,
          roundCurrency(plan.amount / plan.months)
        ]
      );
    }

    await client.query("COMMIT");

    await bildirimOlustur(userId, "Ödeme Alındı", `${plan.label} üyelik ödemeniz başarıyla alındı.`, "odeme");
    const adminIds = await query<{ id: string }>(`SELECT id FROM users WHERE role = 'admin'`);
    await topluBildirimOlustur(
      adminIds.rows.map((item) => item.id),
      "Yeni Üyelik Ödemesi",
      `${plan.label} üyelik ödemesi sisteme işlendi.`,
      "odeme"
    );

    return {
      message: `${plan.label} üyelik ödemesi başarıyla alındı.`,
      invoiceNo
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createPersonalTrainingPayment(
  userId: string,
  payload: CardPayload & { trainerId: string; sessionCount: number }
) {
  const card = validateCard(payload);
  const selectedPackage = SESSION_PACKAGES.find((item) => item.sessionCount === payload.sessionCount);

  if (!selectedPackage) {
    throw new Error("Geçerli bir özel ders paketi seç.");
  }

  const trainerResult = await query<{
    trainer_id: string;
    trainer_name: string;
    hourly_rate: string;
  }>(
    `
      SELECT
        t.id AS trainer_id,
        u.full_name AS trainer_name,
        t.hourly_rate::text
      FROM trainers t
      JOIN users u ON u.id = t.user_id
      WHERE t.id = $1
      LIMIT 1
    `,
    [payload.trainerId]
  );

  const trainer = trainerResult.rows[0];
  if (!trainer) {
    throw new Error("Antrenör bulunamadı.");
  }

  const totalAmount = roundCurrency(
    Number(trainer.hourly_rate) * payload.sessionCount * selectedPackage.multiplier
  );
  const trainerShare = roundCurrency(totalAmount * 0.75);
  const gymShare = roundCurrency(totalAmount - trainerShare);
  const invoiceNo = createInvoiceNo("SGY-OD");

  await query(
    `
      INSERT INTO payments (
        user_id,
        trainer_id,
        amount,
        gym_share,
        trainer_share,
        currency,
        payment_category,
        payment_method,
        payment_status,
        invoice_no,
        session_count,
        card_holder_name,
        card_last4,
        description
      )
      VALUES ($1, $2, $3, $4, $5, 'TRY', 'personal_training', 'credit_card', 'paid', $6, $7, $8, $9, $10)
    `,
    [
      userId,
      trainer.trainer_id,
      totalAmount,
      gymShare,
      trainerShare,
      invoiceNo,
      payload.sessionCount,
      card.holder,
      card.last4,
      `${trainer.trainer_name} ile ${payload.sessionCount} seans özel ders paketi`
    ]
  );

  await bildirimOlustur(userId, "Ödeme Alındı", "Özel ders ödemeniz başarıyla alındı.", "odeme");
  const trainerUserResult = await query<{ user_id: string }>(`SELECT user_id FROM trainers WHERE id = $1 LIMIT 1`, [
    trainer.trainer_id
  ]);
  const adminIds = await query<{ id: string }>(`SELECT id FROM users WHERE role = 'admin'`);
  await topluBildirimOlustur(
    [
      trainerUserResult.rows[0]?.user_id ?? "",
      ...adminIds.rows.map((item) => item.id)
    ],
    "Özel Ders Satışı",
    `${trainer.trainer_name} için ${payload.sessionCount} seanslık özel ders ödemesi alındı.`,
    "odeme"
  );

  return {
    message: "Özel ders ödemesi başarıyla alındı.",
    invoiceNo
  };
}
