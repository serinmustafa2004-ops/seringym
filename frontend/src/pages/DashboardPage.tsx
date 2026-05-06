import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import type {
  DashboardData,
  GymClass,
  ManagedUsersOverview,
  PaymentOverview,
  ProgramOverview,
  RecommendationOverview,
  RewardsData,
  Trainer,
  User
} from "../lib/types";
import { StatCard } from "../components/StatCard";
import { SectionTitle } from "../components/SectionTitle";
import { RewardPanel } from "../components/RewardPanel";
import { TrainerCard } from "../components/TrainerCard";
import { ClassCard } from "../components/ClassCard";
import { PaymentsPanel } from "../components/PaymentsPanel";
import { ProgramsPanel } from "../components/ProgramsPanel";
import { RecommendationsPanel } from "../components/RecommendationsPanel";
import { AttendancePanel } from "../components/AttendancePanel";
import { SalonStatusCard } from "../components/SalonStatusCard";
import { IconBadge } from "../components/IconBadge";
import { EntryPassPanel } from "../components/EntryPassPanel";
import { cevirMetin } from "../lib/translate";
import { SecurityPanel } from "../components/SecurityPanel";
import { NotificationsPopover } from "../components/NotificationsPopover";
import { AdminUsersPanel } from "../components/AdminUsersPanel";
import { ReportsPanel } from "../components/ReportsPanel";

type Props = {
  user: User;
  onLogout: () => void;
};

type MenuKey =
  | "overview"
  | "payments"
  | "programs"
  | "classes"
  | "trainers"
  | "rewards"
  | "recommendations"
  | "attendance"
  | "entryPass"
  | "security"
  | "adminUsers"
  | "reports";

const menuIcons: Record<MenuKey, string> = {
  overview: "◇",
  payments: "●",
  programs: "◇",
  classes: "●",
  trainers: "◇",
  rewards: "●",
  recommendations: "◇",
  attendance: "●",
  entryPass: "◇",
  security: "●",
  adminUsers: "◇",
  reports: "●"
};

const defaultRewards: RewardsData = {
  wallet: { points_balance: 0, lifetime_points: 0, tier_name: "Kapalı" },
  badges: [],
  rewards: [],
  transactions: []
};

function rolEtiketi(role: User["role"]) {
  if (role === "member") return "Üye";
  if (role === "trainer") return "Antrenör";
  return "Yönetici";
}

function uyelikEtiketi(type?: string | null) {
  if (!type) return "Atanmadı";
  if (type === "monthly") return "Aylık";
  if (type === "yearly") return "Yıllık";
  if (type === "daily") return "Günlük";
  return cevirMetin(type);
}

export function DashboardPage({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<MenuKey>("overview");
  const [profileOpen, setProfileOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [rewards, setRewards] = useState<RewardsData>(defaultRewards);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [payments, setPayments] = useState<PaymentOverview | null>(null);
  const [programs, setPrograms] = useState<ProgramOverview | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<ManagedUsersOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const menuItems: Array<{ key: MenuKey; label: string; hidden?: boolean }> = [
    { key: "overview", label: "Genel Bakış" },
    { key: "payments", label: user.role === "member" ? "Ödemeler" : "Ödemeler ve Kazanç" },
    { key: "programs", label: user.role === "member" ? "Programlarım" : "Program Yönetimi" },
    { key: "classes", label: "Dersler" },
    { key: "trainers", label: "Antrenör Pazarı" },
    { key: "rewards", label: "Ödül Sistemi", hidden: user.role !== "member" },
    {
      key: "entryPass",
      label: user.role === "member" ? "Salon Giriş Kodu" : "Kare Kod Okutma",
      hidden: true
    },
    { key: "recommendations", label: "Yapay Zekâ Önerileri" },
    { key: "attendance", label: "Giriş Çıkış Takibi", hidden: user.role !== "admin" },
    { key: "adminUsers", label: "Kullanıcı Yönetimi", hidden: user.role !== "admin" },
    { key: "reports", label: "Raporlar", hidden: user.role !== "admin" },
    { key: "security", label: "Şifre ve Güvenlik" }
  ];

  async function loadData() {
    setLoading(true);
    setLoadError("");
    try {
      const [
        summaryData,
        rewardsData,
        trainerData,
        classData,
        paymentsData,
        programsData,
        recommendationData,
        adminUsersData
      ] = await Promise.all([
        apiRequest<DashboardData>("/dashboard/summary"),
        user.role === "member" ? apiRequest<RewardsData>("/rewards") : Promise.resolve(defaultRewards),
        apiRequest<Trainer[]>("/trainers"),
        apiRequest<GymClass[]>("/classes"),
        apiRequest<PaymentOverview>("/payments/overview"),
        apiRequest<ProgramOverview>("/programs"),
        apiRequest<RecommendationOverview>("/recommendations"),
        user.role === "admin" ? apiRequest<ManagedUsersOverview>("/admin/users") : Promise.resolve(null)
      ]);

      setSummary(summaryData);
      setRewards(rewardsData);
      setTrainers(trainerData);
      setClasses(classData);
      setPayments(paymentsData);
      setPrograms(programsData);
      setRecommendations(recommendationData);
      setAdminUsers(adminUsersData);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Panel verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  if (loading || !summary || !payments || !programs || !recommendations || (user.role === "admin" && !adminUsers)) {
    if (loadError) {
      return (
        <div className="loading-screen">
          <div className="error-panel">
            <h2>Panel yüklenemedi</h2>
            <p>{loadError}</p>
            <button onClick={() => void loadData()}>Tekrar Dene</button>
          </div>
        </div>
      );
    }
    return <div className="loading-screen">Veriler yükleniyor...</div>;
  }

  const loadedSummary = summary;
  const loadedPayments = payments;
  const loadedPrograms = programs;
  const loadedRecommendations = recommendations;

  const overviewCards =
    user.role === "member"
      ? [
          {
            title: "Üyelik Durumu",
            lines: [
              `Plan: ${uyelikEtiketi(summary.profile.membership_type)}`,
              `Bitiş: ${
                summary.profile.end_date
                  ? new Date(summary.profile.end_date).toLocaleDateString("tr-TR")
                  : "Bilgi yok"
              }`,
              `Toplam ödeme: ${Number(payments.summary.total_paid ?? 0).toLocaleString("tr-TR")} TL`
            ]
          },
          {
            title: "Antrenman Takibi",
            lines: [
              `Yaklaşan ders: ${summary.roleStats.upcoming_classes ?? 0}`,
              `Salon ziyareti: ${summary.roleStats.completed_visits ?? 0}`,
              `Aktif program: ${programs.programs.length}`
            ]
          }
        ]
      : user.role === "trainer"
        ? [
            {
              title: "Kazanç Özeti",
              lines: [
                `Toplam kazanç: ${Number(payments.summary.total_earnings ?? 0).toLocaleString("tr-TR")} TL`,
                `Seans cirosu: ${Number(payments.summary.session_revenue ?? 0).toLocaleString("tr-TR")} TL`,
                `Aktif program: ${programs.programs.length}`
              ]
            },
            {
              title: "İtibar ve Operasyon",
              lines: [
                `Ortalama puan: ${summary.roleStats.avg_rating ?? 0}`,
                `Yorum sayısı: ${summary.roleStats.trainer_reviews ?? 0}`,
                `Planlanan ders: ${summary.roleStats.trainer_classes ?? 0}`
              ]
            }
          ]
        : [
            {
              title: "Salon Finans Özeti",
              lines: [
                `Brüt gelir: ${Number(payments.summary.gross_revenue ?? 0).toLocaleString("tr-TR")} TL`,
                `Salon geliri: ${Number(payments.summary.gym_revenue ?? 0).toLocaleString("tr-TR")} TL`,
                `Antrenör ödemeleri: ${Number(payments.summary.trainer_payouts ?? 0).toLocaleString("tr-TR")} TL`
              ]
            },
            {
              title: "Operasyon Özeti",
              lines: [
                `Toplam üye: ${summary.roleStats.total_members ?? 0}`,
                `Yaklaşan ders: ${summary.roleStats.active_classes ?? 0}`,
                `Görünür antrenör: ${summary.roleStats.visible_trainers ?? 0}`
              ]
            }
          ];

  const overviewStats =
    user.role === "member"
      ? [
          { label: "Aktif Puan", value: summary.wallet.points_balance, accent: "orange" as const },
          { label: "Rezervasyon", value: summary.stats.totalBookings, accent: "blue" as const },
          { label: "Katılım", value: summary.stats.attendedClasses, accent: "green" as const },
          {
            label: "Yorumlanan Antrenör",
            value: summary.stats.reviewedTrainers,
            accent: "orange" as const
          }
        ]
      : user.role === "trainer"
        ? [
            {
              label: "Toplam Kazanç",
              value: `${Number(payments.summary.total_earnings ?? 0).toLocaleString("tr-TR")} TL`,
              accent: "orange" as const
            },
            {
              label: "Aktif Program",
              value: programs.programs.length,
              accent: "blue" as const
            },
            {
              label: "Ortalama Puan",
              value: summary.roleStats.avg_rating ?? 0,
              accent: "green" as const
            }
          ]
        : [
            {
              label: "Brüt Gelir",
              value: `${Number(payments.summary.gross_revenue ?? 0).toLocaleString("tr-TR")} TL`,
              accent: "orange" as const
            },
            {
              label: "Toplam Üye",
              value: summary.roleStats.total_members ?? 0,
              accent: "blue" as const
            },
            {
              label: "Toplam İşlem",
              value: payments.summary.payment_count ?? 0,
              accent: "green" as const
            }
          ];

  const profileDetails =
    user.role === "member"
      ? [
          { label: "E-posta", value: summary.profile.email },
          { label: "Üyelik", value: uyelikEtiketi(summary.profile.membership_type) },
          {
            label: "Bitiş",
            value: summary.profile.end_date
              ? new Date(summary.profile.end_date).toLocaleDateString("tr-TR")
              : "Bilgi yok"
          },
          { label: "Aktif Puan", value: String(summary.wallet.points_balance) }
        ]
      : user.role === "trainer"
        ? [
            { label: "E-posta", value: summary.profile.email },
            {
              label: "Toplam Kazanç",
              value: `${Number(payments.summary.total_earnings ?? 0).toLocaleString("tr-TR")} TL`
            },
            { label: "Aktif Program", value: String(programs.programs.length) },
            { label: "Ortalama Puan", value: String(summary.roleStats.avg_rating ?? 0) }
          ]
        : [
            { label: "E-posta", value: summary.profile.email },
            {
              label: "Brüt Gelir",
              value: `${Number(payments.summary.gross_revenue ?? 0).toLocaleString("tr-TR")} TL`
            },
            { label: "Toplam Üye", value: String(summary.roleStats.total_members ?? 0) },
            { label: "Antrenör Sayısı", value: String(summary.roleStats.visible_trainers ?? 0) }
          ];

  function renderActiveSection() {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <section className={`stats-grid stats-grid--${user.role}`}>
              {overviewStats.map((item) => (
                <StatCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
              ))}
            </section>

            <section className={`overview-grid overview-grid--${user.role}`}>
              <div className={`dashboard-grid dashboard-grid--${user.role}`}>
                {overviewCards.map((card) => (
                  <div className="dashboard-card" key={card.title}>
                    <SectionTitle>{card.title}</SectionTitle>
                    <ul className="plain-list">
                      {card.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={`overview-side-stack overview-side-stack--${user.role}`}>
                <SalonStatusCard
                  occupancyRate={Number(loadedSummary.roleStats.occupancyRate ?? 0)}
                  activePeople={Number(loadedSummary.roleStats.activePeople ?? 0)}
                  femaleCount={Number(loadedSummary.roleStats.femaleCount ?? 0)}
                  maleCount={Number(loadedSummary.roleStats.maleCount ?? 0)}
                />
                {(user.role === "member" || user.role === "admin") ? (
                  <EntryPassPanel user={user} />
                ) : null}
              </div>
            </section>

            {user.role === "member" ? (
              <section className="showcase-grid">
                <article className="showcase-card">
                  <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
                    alt="SerinGym serbest ağırlık alanı"
                  />
                </article>
                <article className="showcase-card showcase-card--accent">
                  <img
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80"
                    alt="SerinGym kişisel antrenman alanı"
                  />
                </article>
                <article className="showcase-card showcase-card--small">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"
                    alt="SerinGym grup ders alanı"
                  />
                </article>
              </section>
            ) : null}
          </>
        );
      case "payments":
        return <PaymentsPanel data={loadedPayments} user={user} onRefresh={loadData} />;
      case "programs":
        return <ProgramsPanel data={loadedPrograms} user={user} onRefresh={loadData} />;
      case "classes":
        return (
          <section className="class-grid">
            {classes.map((item) => (
              <ClassCard key={item.id} item={item} onRefresh={loadData} canBook={user.role === "member"} />
            ))}
          </section>
        );
      case "trainers":
        return (
          <section className="trainer-grid">
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                onRefresh={loadData}
                canReview={user.role === "member"}
              />
            ))}
          </section>
        );
      case "rewards":
        return <RewardPanel data={rewards} onRefresh={loadData} />;
      case "entryPass":
        return <EntryPassPanel user={user} />;
      case "recommendations":
        return <RecommendationsPanel data={loadedRecommendations} />;
      case "attendance":
        return <AttendancePanel />;
      case "security":
        return <SecurityPanel user={user} />;
      case "adminUsers":
        return adminUsers ? <AdminUsersPanel data={adminUsers} onRefresh={loadData} /> : null;
      case "reports":
        return <ReportsPanel />;
      default:
        return null;
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          {user.role === "admin" ? <span className="eyebrow">SerinSoft</span> : null}
          <h1>{user.role === "admin" ? "Kontrol Paneli" : "Menü"}</h1>
          <p>{user.role === "member" ? "Üye alanı" : user.role === "trainer" ? "Antrenör alanı" : "Yönetim alanı"}</p>
        </div>

        <nav className="menu-list">
          {menuItems
            .filter((item) => !item.hidden)
            .map((item) => (
              <button
                key={item.key}
                type="button"
                className={activeTab === item.key ? "menu-button menu-button--active" : "menu-button"}
                onClick={() => setActiveTab(item.key)}
              >
                <IconBadge
                  symbol={menuIcons[item.key]}
                  tone={activeTab === item.key ? "slate" : "gold"}
                  size="sm"
                />
                <span className="menu-button__label">{item.label}</span>
              </button>
            ))}
        </nav>

        <div className="sidebar-footer">
          <strong>{user.fullName}</strong>
          <span>{user.email}</span>
          <button className="ghost-button" onClick={onLogout}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      <section className="content-shell">
        <header className="topbar topbar--content">
          <div>
            <div className="card-title-row">
              <IconBadge
                symbol={menuIcons[activeTab]}
                tone={activeTab === "overview" ? "teal" : activeTab === "payments" ? "gold" : "coral"}
                size="sm"
              />
              <div>
                {user.role === "admin" ? <span className="eyebrow">SerinSoft Yönetim</span> : null}
                <h2>
                  {menuItems.find((item) => item.key === activeTab)?.label ?? "Genel Bakış"}
                </h2>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <NotificationsPopover />
            <div className="user-profile-area">
            <button
              type="button"
              className={profileOpen ? "user-chip user-chip--button user-chip--open" : "user-chip user-chip--button"}
              onClick={() => setProfileOpen((current) => !current)}
            >
              <div className="user-chip__meta">
                <strong>{user.fullName}</strong>
                <span className="role-badge">{rolEtiketi(summary.profile.role)}</span>
              </div>
              <IconBadge symbol={profileOpen ? "−" : "+"} tone="slate" size="sm" />
            </button>

            {profileOpen ? (
              <div className="profile-popover">
                <div className="card-title-row">
                  <IconBadge symbol="●" tone="teal" size="sm" />
                  <h3>Genel Bilgiler</h3>
                </div>
                <div className="profile-info-list">
                  {profileDetails.map((item) => (
                    <div key={item.label} className="profile-info-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          </div>
        </header>

        {renderActiveSection()}
      </section>
    </main>
  );
}
